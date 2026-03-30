import { Result, Button } from "antd";

export default function Error500() {
  return (
    <Result
      status="500"
      title="500"
      subTitle="Lỗi hệ thống"
      extra={<Button onClick={() => window.location.reload()}>Reload</Button>}
    />
  );
}