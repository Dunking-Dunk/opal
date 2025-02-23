import { getPaymentInfo } from '@/actions/user'
import PaymentButton from '@/components/global/payment-button'
import React from 'react'

type Props = {}

const BillingPage = async (props: Props) => {
    const payment = await getPaymentInfo()

    return (
        <div className="bg-[#1D1D1D] flex flex-col gap-y-8 p-5 rounded-xl">
            <div>
                <h2 className="text-2xl">Current Plan</h2>
                <p className="text-[#9D9D9D]">Your Payment Histroy</p>
            </div>
            <div className='flex flex-row justify-between'>
                <div className='flex flex-col'>
                    <h2 className="text-2xl">
                        ₹{payment?.data?.subscription?.plan === 'PRO' ? '1000' : '0'}/Month
                    </h2>
                    <p className="text-[#9D9D9D]">{payment?.data?.subscription?.plan}</p>
                </div>
                <div>
                    {payment?.data?.subscription?.plan === 'FREE' && <PaymentButton />}
                </div>
            </div>
        </div>
    )
}

export default BillingPage