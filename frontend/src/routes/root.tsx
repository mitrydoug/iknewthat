import { Link, Outlet, redirect, useSubmit } from "react-router-dom";
import { Avatar, Button, Col, Flex, Layout, Image, Input, Row, Space, Popover } from "antd";
import { UserOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Header, Footer, Content } = Layout;

const baseUrl = import.meta.env.BASE_URL;

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
};

const contentStyle = {
  // textAlign: 'center',
  // minHeight: 120,
  lineHeight: '120px',
  marginTop: '10px',
  overflowY: 'auto',
  height: '100%',
};

const footerStyle = {
  textAlign: 'center',
  color: '#999999',
  backgroundColor: '#f0f0f0',
};



export default function Root() {

  const submit = useSubmit();

  return (
      <Layout>
        <Header style={headerStyle}>
          <Flex align="center" gap="middle" justify="space-between" style={{ width: "100%" }} wrap={false}>
              <div style={{ minWidth: "calc((100vw - 55rem) / 2)", textAlign: "right" }}>
                <a href={baseUrl}><Image id="logo" src={`${baseUrl}/logo.png`} preview={false} /></a>
              </div>
              <div style={{ flex: "1" }}>
                <Search
                  style={{ display: "block", maxWidth: "50rem" }}
                  placeholder="Claim id or commitment hash"
                  allowClear
                  onSearch={(value, _event, { source }) => {
                    if (source === "input") {
                      submit({commitOrId: value}, { method: "post" });
                    }
                  }}
                  size="medium"
                />
              </div>
              <Link to="/claim/create">
                <Button>Make Claim</Button>
              </Link>
              <Link to="/claim/reveal">
                <Button>Reveal Claim</Button>
              </Link>
              <Popover content={<Button type="primary">Connect</Button>}>
                <Avatar size="large" icon={<UserOutlined />} />
              </Popover>
              
          </Flex>
        </Header>
        <Content style={contentStyle}>
          <Row justify="center" style={{width: '100%'}}>
            <Col flex="50rem">
              <Outlet />
            </Col>
          </Row>
          <Footer style={footerStyle}>Made by Mitchell Douglass</Footer>
        </Content>
      </Layout>
  );
}

/**/