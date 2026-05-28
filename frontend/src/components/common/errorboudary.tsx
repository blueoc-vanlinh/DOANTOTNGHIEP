import { Component } from "react";
import type { ReactNode } from "react";
import { Button, Result } from "antd";
import Error500 from "../error/error500";

interface Props {
  children: ReactNode;
}

interface State {   
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="500"
          subTitle="Hệ thống quản lý kho gặp sự cố bất ngờ."
          extra={
            <Button type="primary" onClick={this.handleReset}>
              Thử lại ngay
            </Button>
          }
        >
          <div style={{ marginTop: 20 }}>
            <Error500 />
          </div>
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
