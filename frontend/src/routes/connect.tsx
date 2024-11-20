import { Image, Modal, Button, Typography } from "antd";
import { AppContext } from "../AppContext";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Link, } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL;

interface ConnectProps {
};

const Connect: FC<ConnectProps> = () => {

    const { wallet: { connectWallet, provider, walletState, connectionRequest, setConnectionRequest } } = useContext(AppContext);

    const isModalOpen = !!connectionRequest;

    const handleCancel = useCallback(() => {
        setConnectionRequest(null);
    }, []);

    const handleOk = useCallback(async () => {
        await connectWallet();
        setConnectionRequest(null);
    }, []);

    return (
        <Modal className="connect-modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} closable={false} footer={<></>} centered>
            { !provider ?
                <Typography.Text style={{ fontSize: "20px" }}>No wallet detected. Please install (or enable) <a href="https://metamask.io">MetaMask</a>.</Typography.Text> :
                walletState === "not_connected" ? (
                    <Button onClick={handleOk} style={{ width: "100%", height: "3rem" }}>
                        <Image id="logo" style={{ maxHeight: "3rem" }} src={`${baseUrl}/MetaMask_Fox.svg`} preview={false} />
                        Connect with MetaMask
                    </Button>
                ) : (
                    <Typography.Text style={{ fontSize: "20px" }}>
                        Already Connected! Go to <Link to="/">home page</Link>.
                    </Typography.Text>
                )
            }
        </Modal>
    );
}

export default Connect;