import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'; 
import './layout.css'





const Layout = () => {

    const navigate = useNavigate()


    function Goto(event,data) {
        navigate(data)
    }


    return (
        <>
            <div className='bg-5F605F pb-4'>
                <Container>
                    <Row className='text-center pt-3'>
                        <Col>
                            <Button variant="warning" onClick={(e)=>{Goto(e,'/')}}>Import CSV or Excel</Button>
                        </Col>

                        <Col>
                            <Button variant="warning" onClick={(e)=>{Goto(e,'display')}}>Check Record With certain ID</Button>
                        </Col>

                        <Col>
                            <Button variant="warning" onClick={(e)=>{Goto(e,'displayall')}}>Display All Data</Button>
                        </Col>

                        <Col>
                            <Button variant="warning" onClick={(e)=>{Goto(e,'transfer')}}>Transfer Funds</Button>
                        </Col>
                    </Row>
                </Container>

            </div>
            <Outlet />
        </>
    )
}
export default Layout