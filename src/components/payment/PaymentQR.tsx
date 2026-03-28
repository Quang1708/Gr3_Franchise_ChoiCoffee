export type PaymentQRProps = {
    code: string;
    method: string;
    amount: number;
}

const PaymentQRForm= (props: PaymentQRProps) => {
    

    const BANK_ID = import.meta.env.VITE_BANK_ID;
    const ACCOUNT_NO = import.meta.env.VITE_ACCOUNT_NO;
    const ACCOUNT_NAME = import.meta.env.VITE_ACCOUNT_NAME;
    const ACTUAL_AMOUNT = import.meta.env.VITE_ACTUAL_AMOUNT;

    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${ACTUAL_AMOUNT}&addInfo=${props.code}&accountName=${ACCOUNT_NAME}`;
  return (
        <div className="text-center p-5 border border-gray-200 rounded-xl max-w-100 mx-auto bg-white">
      <h2>Thanh toán đơn hàng</h2>
      <p>Mã đơn: <b>{props.code}</b></p>
      
      {/* Hiển thị giá tiền ĐÚNG trên UI */}
      <h3 className="text-red-600 font-bold">
        Số tiền cần thanh toán: {props.amount.toLocaleString()} VNĐ
      </h3>

      <div className="bg-gray-50 p-3 rounded-lg">
        <img src={qrUrl} alt="Mã QR Thanh Toán" className="w-full" />
        
      </div>
    </div>
  )
}


export default  PaymentQRForm