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
            <Typography.Text style={{ color: "gray", fontSize: "36px" }}>Find a claim</Typography.Text>
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
              <Link to="/claim/create">
                <Button>Create Claim</Button>
              </Link>
              <Link to="/claim/reveal">
                <Button>Reveal Claim</Button>
              </Link>
            </Flex>
            <Link to="/about" style={{ marginTop: "20px", color: "gray", textDecoration: "underline dotted" }}>
                What is iKnewThat?
            </Link>
        </Flex>
    )
}

export default Index;