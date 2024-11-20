import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const Loading = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75%' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: "4rem", color: "#bf9000" }} spin />} />
        </div>
    );
};

export default Loading;