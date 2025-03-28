// src/layout.tsx
import { Layout } from "react-admin";
import CustomMenu from "./components/CustomMenu";
import TopBar from "./components/TopBar"; // Importez votre TopBar

const CustomLayout = (props: any) => (
    <Layout {...props} appBar={TopBar} menu={CustomMenu} />
);

export default CustomLayout;
