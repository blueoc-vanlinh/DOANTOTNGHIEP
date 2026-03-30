import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function Error404() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Trang không tồn tại"
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Về trang chủ
        </Button>
      }
    />
  );
}