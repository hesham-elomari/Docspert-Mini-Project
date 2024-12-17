import React, { useState, useLayoutEffect } from 'react';
import { Container, Row, Col, Card, ListGroup,Spinner } from 'react-bootstrap';
import Axios from 'axios';

const DisplayAll = () => {
    const [accounts, setAccounts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {

        Axios.get('http://127.0.0.1:8000/Accounts/list_all_accounts/') // Replace with your actual endpoint
            .then(response => {
                setAccounts(response.data.data); // Assuming the response is an array of accounts
            })
            .catch(err => {
                setError('Failed to load accounts');
                console.error(err);
            })
            .finally(() => {
                setLoading(false); // Hide spinner
            });
    }, []);

    return (
        <Container>
            <h2 className="pt-5">Account List</h2>

            {loading && (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {error && <p className="text-danger">{error}</p>}

            <Row className="mt-4">



                {accounts.length > 0 ? (
                    <>
                        {accounts.map((account) => {
                            return (
                                <>
                                    <Col key={account.id} md={4} className="mb-4">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>{account.name}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">
                                                    ID: {account.id}
                                                </Card.Subtitle>
                                                <ListGroup className="list-group-flush">
                                                    <ListGroup.Item>Balance: ${account.balance}</ListGroup.Item>
                                                </ListGroup>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                </>

                            )
                        })}
                    </>

                    
                ) : (
                    <p>No accounts found</p>
                )}
            </Row>
        </Container>
    );
};

export default DisplayAll;