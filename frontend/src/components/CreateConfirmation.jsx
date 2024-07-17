import { confirmable } from 'react-confirm';
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button'


const ConfirmCreate = ({ 
    show,
    proceed,
    dismiss,
    message,
}) => {

    const handleOnClick = () => {
        return () => {
          proceed({});
        }
    }
    console.log({show, proceed, dismiss, message})

    return (
        <div className="static-modal">
            <Modal animation={false} show={show} onHide={dismiss}>
                <Modal.Header>
                <Modal.Title>Title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message}
                </Modal.Body>
                <Modal.Footer>
                <Button onClick={dismiss}>Cancel</Button>
                <Button className='button-l' onClick={handleOnClick()}>Make Claim</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default confirmable(ConfirmCreate)