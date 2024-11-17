import { Link, Outlet, redirect, useLocation, useNavigate, useSubmit } from "react-router-dom";
import { Avatar, Button, Col, Flex, Layout, Image, Input, Row, Space, Popover, Typography } from "antd";
import { EyeOutlined, LogoutOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import { onSearchClaim } from "../utils";
import jazzicon from "@metamask/jazzicon"

const { Search } = Input;
const { Header, Content } = Layout;

const baseUrl = import.meta.env.BASE_URL;

const headerStyle = {
  boxShadow: '1px 1px 10px hsla(0, 0%, 0%, 0.2)',
  backgroundColor: '#ffffff',
  padding: '10px 20px',
  display: 'flex',
};

const contentStyle = {
  // textAlign: 'center',
  // minHeight: 120,
  marginTop: '10px',
  overflowY: 'auto',
};

const footerStyle = {
  textAlign: 'center',
  color: '#999999',
  backgroundColor: '#f0f0f0',
};


const metamaskIcon = (address) => {
  console.log(address);
  const jazziconData = jazzicon(16, parseInt(address.slice(2, 10), 16));
  const jazziconSvg = new XMLSerializer().serializeToString(jazziconData.children[0]);
  return `data:image/svg+xml,${encodeURIComponent(jazziconSvg)}`;
}


export default function Root() {

  const navigate = useNavigate();
  const submit = useSubmit();

  const [avatar, setAvatar] = useState(null);
  const { wallet: { address, walletState }  } = useContext(AppContext);
  const location = useLocation();
  
  const isIndex = location.pathname === "/";

  useEffect(() => {
    if (address) {
      setAvatar(metamaskIcon(address));
    } else {
      setAvatar(null);
    }

  }, [address]);

  const popoverContent = (
    walletState === "connected" ?
        <span style={{ fontSize: "20px", }}>{address.slice(0, 5) + "..." + address.slice(-5)}</span>
       :
      <Button type="primary" onClick={() => navigate("/connect")}>Connect</Button>
  );

  return (
      <Layout style={{ height: "100vh" }}>
        <Header style={headerStyle}>
          <Flex align="center" gap="middle" justify="space-between" style={{ width: "100%" }} wrap={false}>
              <div style={{ textAlign: "left" }}>
                <Link to="/"><Image id="logo" src={`${baseUrl}/logo.svg`} preview={false} /></Link>
              </div>
              <div style={{ flex: "1" }}>
                <Search
                  className="top-search"
                  style={{ display: isIndex ? "none" : "block", maxWidth: "30rem" }}
                  placeholder="Claim id or commitment hash"
                  allowClear
                  onSearch={(value, _event, { source }) => {
                    if (source === "input") {
                      onSearchClaim(value, navigate);
                    }
                  }}
                  size="medium"
                />
              </div>
              <Flex gap="small" align="center">
                <Link to="/claim/create">
                  <Button style={{ padding: "10px" }}><PlusOutlined/></Button>
                </Link>
                <Link to="/claim/reveal">
                  <Button style={{ padding: "10px" }}><EyeOutlined/></Button>
                </Link>
              </Flex>
              <Popover content={popoverContent}>
                { avatar ?
                    <Avatar size="large" src={<img src={avatar} alt="avatar" />} /> :
                    <Avatar size="large" icon={ <UserOutlined /> } /> }
              </Popover>
              
          </Flex>
        </Header>
        <Content style={contentStyle}>
          <Flex vertical style={{ height: "100%" }}>
            <div style={{ maxWidth: "50rem", margin: "auto", flex: "1", width: "100%" }}>
              <Outlet />
            </div>
            <Flex className="footer" justify="center" align="center" gap="large">
              <Typography.Text style={{ color: "gray" }}>Created by Mitchell Douglass</Typography.Text>
              <a href="https://github.com/mitrydoug/iknewthat" target="_blank" rel="noreferrer">
                <Image src={`${baseUrl}/github-mark.svg`} preview={false} style={{ width: "2rem" }}/>
              </a>
            </Flex>
          </Flex>
        </Content>
      </Layout>
  );
}

/**/