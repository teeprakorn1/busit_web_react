import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import styles from './NotFoundPage.module.css';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <Helmet>
                <title>404 - Page Not Found</title>
                <meta name="description" content="The page you are looking for could not be found. Please return to the main page." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <h1 className={styles.title}>404</h1>
            <p className={styles.message}>
                <FiAlertTriangle
                    style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#e63946' }}
                    size={50}
                    aria-hidden="true"
                />
                We’re sorry, but the page you requested could not be found. Please return to the main page.
            </p>
            <button
                onClick={() => navigate('/')}
                className={styles.button}
                aria-label="Go back to main page"
            >
                Go to Main
            </button>
        </div>
    );
};

export default NotFoundPage;