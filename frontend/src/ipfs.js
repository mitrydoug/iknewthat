import { create } from '@web3-storage/w3up-client'

export async function getIPFS() {

    const client = await create();
    console.log("A");
    
    const account = await client.login("mrdouglass95@gmail.com");
    console.log("B");

    while (true) {
        const res = await account.plan.get();
        if (res.ok) break;
        console.log('Waiting for payment plan to be selected...');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("C");

    return null;
}