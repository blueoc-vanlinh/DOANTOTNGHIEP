import { Modal, Form, InputNumber, Select, Row, Col } from "antd";
import type { ModalProps } from "antd";
import type { FC } from "react";
import SearchCombobox from "@/components/common/SearchCombobox";
import Input from "@/components/common/Input";
import type { Product, ProductInput } from "../types";

interface Category {
    id: number;
    name: string;
}

interface ProductFormModalProps extends Omit<ModalProps, "onOk"> {
    open: boolean;
    editing: Product | null;
    categories: Category[];
    onCancel: () => void;
    onSubmit: (values: ProductInput) => void;
    loading?: boolean;
}

const ProductFormModal: FC<ProductFormModalProps> = ({
    open,
    editing,
    categories,
    onCancel,
    onSubmit,
    loading = false,
    ...modalProps
}) => {
    const [form] = Form.useForm<ProductInput>();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    const handleAfterOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            if (editing) {
                form.setFieldsValue({
                    ...editing,
                    dimensions: editing.dimensions
                        ? {
                            depth: editing.dimensions.depth || 0,
                            width: editing.dimensions.width || 0,
                            height: editing.dimensions.height || 0,
                        }
                        : undefined,
                });
            } else {
                form.resetFields();
            }
        }
    };

    return (
        <Modal
            title={editing ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            width={820}
            destroyOnClose
            afterOpenChange={handleAfterOpenChange}
            okText={editing ? "Cập nhật" : "Tạo mới"}
            cancelText="Hủy"
            {...modalProps}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
                <Row gutter={[24, 12]}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Tên sản phẩm"
                            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                        >
                            <Input placeholder="Nhập tên sản phẩm" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="category_id"
                            label="Phân loại"
                        >
                            <SearchCombobox
                                placeholder="Chọn phân loại"
                                options={categories.map((c) => ({
                                    label: c.name,
                                    value: c.id,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="sku"
                            label="Mã SKU"
                            rules={[{ required: true, message: "Vui lòng nhập mã SKU" }]}
                        >
                            <Input placeholder="Ví dụ: SP-00123" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                            <Select
                                options={[
                                    { label: "Đang bán", value: "ACTIVE" },
                                    { label: "Ngừng bán", value: "INACTIVE" },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="barcode" label="Barcode">
                            <Input placeholder="Nhập mã vạch" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="weight" label="Cân nặng (kg)">
                            <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="price"
                            label="Giá bán (VNĐ)"
                            rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                formatter={(value) =>
                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Kích thước (D × R × C)" style={{ marginTop: 8 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name={["dimensions", "depth"]} noStyle>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder="Dài (cm)"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name={["dimensions", "width"]} noStyle>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder="Rộng (cm)"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name={["dimensions", "height"]} noStyle>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder="Cao (cm)"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;