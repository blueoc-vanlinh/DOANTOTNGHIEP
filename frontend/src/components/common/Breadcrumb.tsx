import { Breadcrumb as AntdBreadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import { homeUrl } from "@/routes/urls";

const Breadcrumb = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split("/").filter((i) => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return {
      key: url,
      title: <Link to={url}>{pathSnippets[index].toUpperCase()}</Link>,
    };
  });

  const breadcrumbItems = [
    {
      title: <Link to={homeUrl}>Trang chủ</Link>,
      key: "home",
    },
    ...extraBreadcrumbItems,
  ];

  return <AntdBreadcrumb items={breadcrumbItems} style={{ margin: "16px 0" }} />;
};

export default Breadcrumb;
