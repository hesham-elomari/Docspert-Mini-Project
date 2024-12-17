import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Axios from 'axios';

const DisplayDetails = () => {
    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm();
    const [searchResults, setSearchResults] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {

        setLoading(true)
        Axios.get(`http://127.0.0.1:8000/Accounts/get_account_details/?search=` + data.search).then(
            (response) => {
                if (response.data.data.length > 0) {
                    setSearchResults(response.data.data);
                    setErrorMessage('');
                } else {
                    setErrorMessage('No account found matching the search criteria.');
                    setSearchResults(null);
                }

            })
            .catch((response) => {

                var error_string = ""

                if (response.response.data.serializer_error ==true){
                    for(let i=0; i<=response.response.data.errors['non_field_errors'].length-1;i++){
                        error_string = error_string + response.response.data.errors['non_field_errors'][i]
                    }
                    setErrorMessage(error_string)
                }else{
                    setErrorMessage(response.response.data.message)
                }

                setSearchResults(null)



            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleChange = (e) => {
        clearErrors('search');
    };

    return (
        <Container>
            <h2 className="pt-5">Search for an Account</h2>


            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}


            <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group controlId="search">
                    <Form.Label>Search by ID or Name</Form.Label>
                    <Form.Control
                        type="text"
                        {...register('search', {
                            required: 'This field is required',
                            minLength: { value: 1, message: 'Search term must be at least 1 character long' }
                        })}
                        isInvalid={!!errors.search}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.search && errors.search.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                    Search
                </Button>
            </Form>

            {loading && (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}



            {searchResults && searchResults.length > 0 && (
                <Row className="mt-4">
                    {searchResults.map(account => (
                        <Col key={account.id} md={4} className="mb-4">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{account.name}</h5>
                                    <p className="card-text">ID: {account.id}</p>
                                    <p className="card-text">Balance: ${account.balance}</p>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default DisplayDetails;
