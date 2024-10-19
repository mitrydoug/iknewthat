import React from "react";
import { Link, Outlet, redirect, useSubmit } from "react-router-dom";
import { Button, Col, Flex, Form, Layout, Image, Input, Row } from "antd";

const { Search } = Input;
const { Header, Footer, Sider, Content } = Layout;



export const lookup = async ({ request }) => {
  const formData = Object.fromEntries(await request.formData());
  const isBytes32 = (str => /^0x[A-F0-9]{64}$/i.test(str));
  console.log(formData);
  if (!isNaN(formData.commitOrId) && String(parseInt(formData.commitOrId)) === formData.commitOrId) {
    return redirect(`/claim/id/${formData.commitOrId}`);
  } else if (isBytes32(formData.commitOrId)){
    return redirect(`/claim/${formData.commitOrId}`);
  } else {
    alert("Invalid Input");
    return redirect('/');
  }
}

const headerStyle = {
  boxShadow: '1px 1px 10px hsla(0, 0%, 0%, 0.2)',
  backgroundColor: '#ffffff',
  padding: '10px',
  display: 'flex',
  height: '80px',
};

const contentStyle = {
  // textAlign: 'center',
  // minHeight: 120,
  lineHeight: '120px',
  marginTop: '10px',
};

const footerStyle = {
  textAlign: 'center',
  color: '#999999',
  backgroundColor: '#f0f0f0',
};



export default function Root() {

  const submit = useSubmit();

  const doSubmit = () => {
    submit(null, {method: "post"});
  };

  return (
      <Layout style={{ height: '100vh' }}>
        <Header style={headerStyle}>
          <Row align="middle" style={{ width: "100%" }} gutter={24}>
            <Col flex="auto">
              <Flex justify="flex-end">
                <a href="/"><Image id="logo" src="/logo.png" preview={false} /></a>
              </Flex>
            </Col>
            <Col flex="50rem">
              <Flex align="center" >
                <Search
                  placeholder="input search text"
                  allowClear
                  onSearch={(value, event, { source }) => {
                    source === "input" ? submit({commitOrId: value}, { method: "post" }) : null; 
                  }}
                  size="medium"
                />
              </Flex>
            </Col>
            <Col flex="auto">
              <Flex align="center" gap="middle">
                <Link to="/claim/create">
                  <Button>Make Claim</Button>
                </Link>
                <Link to="/claim/reveal">
                  <Button>Reveal Claim</Button>
                </Link>
              </Flex>
            </Col>
          </Row>
        </Header>
        <Content style={contentStyle}>
          <Row justify="center" style={{width: '100%'}}>
            <Col flex="50rem">
              <Outlet />
            </Col>
          </Row>
        </Content>
        <Footer style={footerStyle}>Made by Mitchell Douglass</Footer>
      </Layout>
  );
}