import { useContext } from "react";
import { Button, Flex, Input, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import { onSearchClaim } from "../utils";

const { Search } = Input;

const Index = () => {

    const navigate = useNavigate();

    return (
        <Flex vertical align="center" justify="center" gap="middle" style={{ height: "70%" }}>
            <Typography.Text style={{ color: "gray", fontSize: "36px", fontFamily: "system-ui" }}>Find a claim</Typography.Text>
            <Search
                style={{ display: "block", maxWidth: "50rem" }}
                placeholder="Claim id or commitment hash"
                allowClear
                onSearch={(value, _event, { source }) => {
                    if (source === "input") {
                        onSearchClaim(value, navigate);
                    }
                }}
                size="large"
            />
            <Flex justify="center" align="baseline" gap="small">
              <Typography.Text style={{ color: "gray" }}>Or ...</Typography.Text>
              <Button onClick={() => navigate("/claim/create")}>Create Claim</Button>
              <Button onClick={() => navigate("/claim/reveal")}>Reveal Claim</Button>
            </Flex>
            <Link to="/about" style={{ marginTop: "20px", color: "gray", textDecoration: "underline dotted" }}>
                What is iKnewThat?
            </Link>
        </Flex>
    )
}

export default Index;