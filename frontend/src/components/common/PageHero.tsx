import { Space, Typography } from "antd";
import type { ReactNode } from "react";

const { Title, Text } = Typography;

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div>
        {eyebrow && <div className="page-kicker">{eyebrow}</div>}
        <Title level={2} style={{ margin: "6px 0 4px" }}>
          {title}
        </Title>
        {description && <Text type="secondary">{description}</Text>}
      </div>
      {actions && (
        <Space wrap size={12} className="page-hero-actions">
          {actions}
        </Space>
      )}
    </section>
  );
}
