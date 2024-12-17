import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react';
import Axios from 'axios';




const ImportFiles = () => {

    const navigate = useNavigate()

    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFiles(e.target.files); // Capture selected files
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            setMessage("Please select at least one file.");
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });

        setLoading(true)
        Axios.post(`http://127.0.0.1:8000/Accounts/importcsv/`, formData).then(
            (response) => {
                setMessage(response.data.message || "Files uploaded successfully!");
            })
            .catch((response) => {
                var error_string = ""

                if (response.response.data.serializer_error == true) {
                    for (let i = 0; i <= response.response.data.errors['non_field_errors'].length - 1; i++) {
                        error_string = error_string + response.response.data.errors['non_field_errors'][i]
                    }
                    setMessage(error_string)
                } else {
                    setMessage(response.response.data.message)
                }
            })
            .finally(() => {
                setLoading(false); // Hide spinner
            });


    };


    return (
        <Container className='pt-5'>
            <Row>
                <Col>
                    <h2>Import Files</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="fileInput" className="mb-3">
                            <Form.Label>Select Files</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary">
                            Upload
                        </Button>
                    </Form>

                    {loading && (
                        <div className="d-flex justify-content-center my-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    )}
                    {message && <p className="mt-3">{message}</p>}
                </Col>
            </Row>
        </Container>
    )
}
export default ImportFiles