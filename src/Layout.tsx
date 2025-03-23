import { Layout, AppBar, Menu } from "react-admin";
import { Typography } from "@mui/material";

const CustomAppBar = () => (
  <AppBar>
    <Typography variant="h6" color="inherit">
      Admin Dashboard
    </Typography>
  </AppBar>
);

const CustomLayout = (props: any) => <Layout {...props} appBar={CustomAppBar} menu={Menu} />;

export default CustomLayout;
