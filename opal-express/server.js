const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const { Readable } = require('stream')
const fs = require('fs')
const axios = require('axios')
const {S3Client,PutObjectCommand} = require('@aws-sdk/client-s3');
const OpenAI  = require('openai');

const app = express();

dotenv.config();

const server = http.createServer(app);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
})

app.use(cors());

const s3 = new S3Client(
    {
        credentials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_KEY
        },
        region: process.env.BUCKET_REGION
    }
)

const io = new Server(server, {
  cors: {
    origin: process.env.ELECTRON_HOST,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
    console.log('🟢 Socket Is Connected');
    let recordedChunks = []

    socket.on('video-chunks', async (data) => {
        console.log('🟢 Video chunk is sent', data);
        const writeStream = fs.createWriteStream('temp_upload/' + data.filename)
        recordedChunks.push(data.chunks)
        const videoBlob = new Blob(recordedChunks, {
            type: 'video/webm; codecs=vp9'
        })
        const buffer = Buffer.from(await videoBlob.arrayBuffer())
        const readStream = Readable.from(buffer)
        readStream.pipe(writeStream).on('finish', () => {
            console.log('Chunk Saved')
        })
    });
  
    socket.on('process-video', async (data) => {
        console.log('🟢 Processing video...');
        recordedChunks = [];
      
        fs.readFile('temp_upload/' + data.filename, async (err, file) => {
          const processing = await axios.post(
            `${process.env.NEXT_API_HOST}recording/${data.userId}/processing`,
            {filename: data.filename}
          );
      
          if (processing.data.status !== 200) {
            return console.log('🔴 Error: Something went wrong with creating the processing file');
          }
      
          const Key = data.filename;
          const Bucket = process.env.BUCKET_NAME;
          const ContentType = 'video/webm';
          const command = new PutObjectCommand({
            Key,
            Bucket,
            ContentType,
            Body: file,
          });
      
          const fileStatus = await s3.send(command);
      
          if (fileStatus['$metadata'].httpStatusCode === 200) {
            console.log('🟢 Video Uploaded To AWS');
      
            if (processing.data.plan === 'PRO') {
              fs.stat('temp_upload/' + data.filename, async (err, stat) => {
                if (!err) {
                  // Free transcription service (Google Cloud Speech-to-Text)
                  if (stat.size < 25000000) {
                    const audioContent = fs.readFileSync(`temp_upload/${data.filename}`).toString('base64');
                    const transcriptionResponse = await axios.post(
                      `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_CLOUD_API}`,
                      {
                        config: {
                          encoding: 'LINEAR16',
                          sampleRateHertz: 16000,
                          languageCode: 'en-US',
                        },
                        audio: {
                          content: audioContent,
                        },
                      }
                    );
      
                    const transcription = transcriptionResponse.data.results
                      ?.map((result) => result.alternatives[0].transcript)
                      .join(' ');
      
                    if (transcription) {
                      // Summarization using Hugging Face API
                      const summaryResponse = await axios.post(
                        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
                        { inputs: transcription },
                        {
                          headers: {
                            Authorization: process.env.HUGGING_FACE_KEY,
                          },
                        }
                      );
      
                      const summary = summaryResponse.data.summary_text;
      
                      const titleAndSummaryGenerated = await axios.post(
                        `${process.env.NEXT_API_HOST}recording/${data.userId}/transcribe`,
                        {
                          filename: data.filename,
                          content: summary,
                          transcript: transcription,
                        }
                      );
      
                      if (titleAndSummaryGenerated.data.status !== 200) {
                        console.log('🔴 Error: Something went wrong when creating the title and description');
                      }
                    }
                  }
                }
              });
            }
      
            const stopProcessing = await axios.post(
              `${process.env.NEXT_API_HOST}recording/${data.userId}/complete`,
              { filename: data.filename }
            );
      
            if (stopProcessing.data.status !== 200) {
              console.log('Error something went wrong when stopping the process and trying to complete the processing stage');
            }
            if (stopProcessing.status === 200) {
              fs.unlink('temp_upload/' + data.filename, (err) => {
                if (!err) console.log(data.filename + ' deleted successfully');
              });
            }
          } else {
            console.log('Error. Upload failed! process aborted');
          }
        });
      });
      
      
  
    socket.on('disconnect', async () => {
      console.log('🔴 Socket.id is disconnected', socket.id);
    });
  });
  

server.listen(5001, () => {
  console.log('🟢 Listening to port 5001');
});
