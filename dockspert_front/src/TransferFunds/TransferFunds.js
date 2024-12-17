import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Alert } from 'react-bootstrap';
import { Button, Dropdown, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Axios from 'axios';
import * as yup from 'yup'; // Import yup for validation
import { yupResolver } from '@hookform/resolvers/yup';




const TransferFunds = () => {

    const [loading, setLoading] = useState(false);

    const validationSchema = yup.object({
        id_from: yup.string()
            .required('Required')
            .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, 'Must be a valid UUID.')
        ,
        balance_from: yup.number()
            .required('Required')
            .transform((value, originalValue) => {
                if (originalValue === "" || originalValue === null) return 0; // Default to 0 if empty
                return value;
            })

            .min(1, 'Value must be greater than 0 and must be a number.')
        ,
        id_to: yup.string()
            .required('Required')
            .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, 'Must be a valid UUID.')

    });

    const navigate = useNavigate()


    function Goto() {
        navigate('/')
    }

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    const [submitStatus, setSubmitStatus] = useState(null);
    const [errormessage, seterrormessage] = useState("");

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema), // Use yupResolver to connect the validation schema
        defaultValues: {
            balance_from: 1, // Default value for balance_from to avoid NaN issues
        }

    });

    const onSubmit = async (data) => {

        if (!uuidRegex.test(data.id_from)) {
            setError('id_from', { type: 'manual', message: 'Must be a valid UUID.' });
        }

        if (!uuidRegex.test(data.id_to)) {
            setError('id_to', { type: 'manual', message: 'Must be a valid UUID.' });
        }

        // If any UUIDs are invalid, do not submit
        if (errors.id_from || errors.id_to) {
            return;
        }

        setLoading(true)
        Axios.post(`http://127.0.0.1:8000/Accounts/transfer_to/`, data).then(
            (response) => {
                seterrormessage(response.data.message)
            })
            .catch((response) => {
                var list_of_errors = response.response.data.errors

                Object.keys(list_of_errors).forEach(field => {
                    if (Array.isArray(list_of_errors[field]) && list_of_errors[field].length > 0) {
                        setError(field, { type: "manual", message: list_of_errors[field][0] });
                    }
                });

                var error_string = ""

                if (response.response.data.serializer_error ==true){
                    for(let i=0; i<=response.response.data.errors['non_field_errors'].length-1;i++){
                        error_string = error_string + response.response.data.errors['non_field_errors'][i]
                    }
                    seterrormessage(error_string)
                }else{
                    seterrormessage(response.response.data.message)
                }

                
            })
            .finally(() => {
                setLoading(false);
            });


    };

    const handleUUIDChange = (event, data) => {
        const value = event.target.value;

        // If value matches the UUID regex, clear any existing error
        if (uuidRegex.test(value)) {
            clearErrors(data);
        } else {
            // Set error if it doesn't match the UUID format
            setError(data, {
                type: 'manual',
                message: 'Must be a valid UUID.'
            });
        }
    };


    return (
        <Container>
            <h2 className='pt-5'>Transfer Form</h2>

            {submitStatus && (
                <Alert variant={submitStatus === 'Transfer Successful' ? 'success' : 'danger'}>
                    {submitStatus}
                </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group controlId="id_from">
                    <Form.Label>From Account ID</Form.Label>
                    <Form.Control
                        {...register('id_from')}
                        type="text"
                        isInvalid={!!errors.id_from}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.id_from && errors.id_from.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="balance_from">
                    <Form.Label>Amount to Transfer</Form.Label>
                    <Form.Control
                        {...register('balance_from')}
                        type="number"
                        step="0.0000000001"
                        isInvalid={!!errors.balance_from}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.balance_from && errors.balance_from.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="id_to">
                    <Form.Label>To Account ID</Form.Label>
                    <Form.Control
                        {...register('id_to')}
                        type="text"
                        isInvalid={!!errors.id_to}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.id_to && errors.id_to.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                    Submit Transfer
                </Button>
            </Form>

            {loading && (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}


            <Row className="pt-5 ps-3">
                {errormessage}
            </Row>
        </Container>
    );

}
export default TransferFunds