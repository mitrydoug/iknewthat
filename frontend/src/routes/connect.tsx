import { Flex, Button, Typography } from "antd";
import { AppContext } from "../AppContext";
import { FC, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

interface ConnectProps {
    onConnect: () => void;
}

const Connect: FC<ConnectProps> = ({ onConnect }) => {

    const { iKnewThat, wallet: { provider } } = useContext(AppContext);
    const navigate = useNavigate();

    console.log(onConnect);

    return (
        <Flex vertical align="center" justify="center" gap="middle" style={{ height: "70%" }}>
            { !provider ?
                <Typography.Text style={{ fontSize: "20px" }}>No wallet detected. Please install (or enable) <a href="https://metamask.io">MetaMask</a>.</Typography.Text> :
                !iKnewThat ?
                    <Button type="primary" size="large" onClick={() => { onConnect(); navigate("/"); }}>Connect with MetaMask</Button> :
                    <Typography.Text style={{ fontSize: "20px" }}>Already Connected! Go to <Link to="/">home page</Link>.</Typography.Text> 
            
                }  
        </Flex>
    );
}

export default Connect;