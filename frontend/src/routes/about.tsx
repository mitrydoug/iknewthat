
import { Typography } from 'antd';

const { Title, Paragraph, Text, Link } = Typography;

const About = () => {
    return (
        <>
            <Title level={1}>Welcome to iKnewThat!</Title>
            <Paragraph>
                This site allows you to reveal information in the future, while proving you knew it as early as today. For example, suppose you manage an investment fund and want to enable your investors to verify your performance without giving away your edge. You could publish a daily claim on iKnewThat listing financial trades (if any) made that day, revealing each claim six months later. This way, anyone can verify your financial performance after the fact.
            </Paragraph>
            <Paragraph>
                This site is a distributed application (DApp) built on the <Link href="https://ethereum.org/" target="_blank">Ethereum blockchain</Link>. This means you don't have to trust me or any company to provide the facts. Rather, the iKnewThat DApp enables you to store facts on the blockchain, where they cannot be modified, and leverages Cryptography to enable the separation of the creation of a claim from its reveal.
            </Paragraph>
            <Title level={3}>Getting Started</Title>
            <Paragraph>
                Search for claims by their claim id or commit hash. To create a claim, click <Text strong>Create Claim</Text>, give your claim a title, add a description, and optionally add any number of file attachments. The description field supports <Link href="https://commonmark.org/help/" target="_blank">Markdown</Link>. When you're ready, click Submit, click Ok, and confirm the resulting transaction using MetaMask. You'll be directed to a page for your newly created claim, but it will be "concealed". You will also notice a new download associated with your claim (a <Text code>.claim</Text> file). To reveal a claim, click <Text strong>Reveal Claim</Text> and select the <Text code>.claim</Text> associated with your claim, click Reveal, and confirm the resulting transaction using MetaMask. Only once you have revealed a claim can anyone see the details of your claim.
            </Paragraph>
            <Title level={3}>Disclaimer</Title>
            <Paragraph>
                This is an experimental site! It has not undergone a security audit. <b>You</b> bear full responsibility for transactions submitted to the network.
            </Paragraph>
            <Paragraph>
                Transactions with this application never involve payment of ETH; you should only need to pay gas fees. Take care when submitting transactions.
            </Paragraph>
            <Title level={3}>More Details ...</Title>
            <Paragraph>
                This DApp is deployed to a <Link href="https://ethereum.org/en/layer-2/">Layer 2</Link> solution called <Link href="https://arbitrum.io/">Arbitrum One</Link>. This means that transactions are fast and cheap, but you will need to have an <Link href="https://ethereum.org/en/wallets/">Ethereum wallet</Link> that supports Arbitrum, and you will need to <Link href="https://bridge.arbitrum.io/">move some ETH to the Arbitrum network</Link> to pay for gas fees.
            </Paragraph> 
        </>
    );
}

export default About;