import { useTranslation } from 'react-i18next';
import { apiService } from "../api";
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { FaPen, FaTimes } from 'react-icons/fa';
import { Modal, ConfirmationModal } from "../components/modal/confirmModal"
import '../styles/profile.css';

const ProfilePage = () => {
    const {t} = useTranslation('profile');
    const {t: tApi} = useTranslation('api');
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        username: "",
        userId: "",
        avatar: URL,
        stats: {
            processedPublications: 0,
            correctRecords: 0,
            checkRatio: 0,
            speciesCount: 0,
            mostCommonSpecies: null
        },
        records: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'});

    const [modal, setModal] = useState({
        isOpen: false,
        type: 'info',
        message: '',
    });

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        action: null,
        hash: null,
        title: '',
        message: ''
    });

    const [actionStatus, setActionStatus] = useState({
        loading: false,
        error: null,
        success: null
    });

    const handleEdit = (hash) => {
        navigate(`/edit/${hash}`);
    };

    const handleDelete = (hash) => {
        setConfirmationModal({
            isOpen: true,
            action: 'delete',
            hash,
            title: t("del.title"),
            message: t("del.message")
        });
    };
    const confirmAction = async () => {
        const {action, hash} = confirmationModal;
        setConfirmationModal({...confirmationModal, isOpen: false});

        setActionStatus({loading: true, error: null, success: null});

        try {
            if (action === 'edit') {
                navigate(`/edit/${hash}`);
            } else if (action === 'delete') {
                await apiService.deleteRecord(hash, tApi);
                setModal({
                    isOpen: true,
                    type: 'success',
                    message: t("del.success")
                });
                setProfile(prev => ({
                    ...prev,
                    records: prev.records.filter(r => r.hash !== hash)
                }));
            }
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                message: error.message || t("errors.del")
            });
        } finally {
            setActionStatus({loading: false, error: null, success: null});
        }
    };

    const cancelAction = () => {
        setConfirmationModal({...confirmationModal, isOpen: false});
    };

    const closeModal = () => {
        setModal({...modal, isOpen: false});
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const per_stats = await apiService.getProfile(tApi);

            let avatarUrl = null;

            if (per_stats.data[1]) {
                avatarUrl = await apiService.getProfilePhoto(per_stats.data[1]);
            }

            const profileData = {
                username: per_stats.data[0] || t("user.no_username"),
                userId: per_stats.data[1],
                avatar: avatarUrl,
                stats: {
                    processedPublications: per_stats.data[2].processed_publs || 0,
                    correctRecords: per_stats.data[2].rec_ok || 0,
                    checkRatio: per_stats.data[2].check_ratio || 0,
                    speciesCount: per_stats.data[2].species_count || 0,
                    mostCommonSpecies: per_stats.data[2].most_common_species || t("errors.MVSpecies")
                },
                records: Array.isArray(per_stats.data[3]) ? per_stats.data[3] : [].map(record => ({
                    ...record,
                    hash: record.hash || ""
                }))
            };

            setProfile(profileData);
        } catch (error) {
            console.error("Error while loading profile:", error);
            setError(error.message || t("errors.user"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const [downloadStatus, setDownloadStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    const handleDownloadRecords = async () => {
        try {
            setDownloadStatus({
                loading: true,
                error: null,
                success: false
            });

            const response = await apiService.downloadRecords(tApi);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = 'records.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setDownloadStatus({
                loading: false,
                error: null,
                success: true
            });

            setTimeout(() => {
                setDownloadStatus(prev => ({...prev, success: false}));
            }, 3000);

        } catch (error) {
            setDownloadStatus({
                loading: false,
                error: error.message || t("errors.user"),
                success: false
            });
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const sortedRecords = React.useMemo(() => {
        if (!sortConfig.key) return profile.records;

        return [...profile.records].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [profile.records, sortConfig]);

    if (loading) {
        return <div className="loading-message">
            {t("user.loading")}<span className="loading-dots"></span>
        </div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="profile-container">
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onConfirm={confirmAction}
                onCancel={cancelAction}
                title={confirmationModal.title}
                message={confirmationModal.message}
            />

            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                type={modal.type}
            >
                <p>{modal.message}</p>
            </Modal>
            <div className="profile-sidebar">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={t("user.pfp")}/>
                        ) : (
                            <div className="avatar-fallback">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h2 className="profile-name">{profile.username}</h2>
                    <div className="profile-id">ID: {profile.userId}</div>
                </div>

                <div className="quick-stats">
                    <div className="stat-item">
                        <div className="stat-number">{profile.stats.processedPublications}</div>
                        <div className="stat-label">{t("summary.publ_processed")}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{profile.stats.speciesCount}</div>
                        <div className="stat-label">{t("summary.species_found")}</div>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <section className="stats-section">
                    <div className="section-header">
                        <h2 className="section-title">{t("summary.title")}</h2>
                        <button
                            onClick={handleDownloadRecords}
                            disabled={downloadStatus.loading || profile.records.length === 0}
                            className="download-records-button"
                        >
                            {downloadStatus.loading ? t("download.downloading") : t("download.button")}
                        </button>
                    </div>

                    {downloadStatus.error && (
                        <div className="download-error">
                            {downloadStatus.error}
                        </div>
                    )}
                    {downloadStatus.success && (
                        <div className="download-success">
                            {t("download.success")}
                        </div>
                    )}

                    {actionStatus.error && (
                        <div className="action-error">
                            {actionStatus.error}
                        </div>
                    )}
                    {actionStatus.success && (
                        <div className="action-success">
                            {actionStatus.success}
                        </div>
                    )}

                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>{t("summary.publ_processed")}</h3>
                            <div className="stat-value">{profile.stats.processedPublications}</div>
                        </div>

                        <div className="stat-card">
                            <h3>{t("summary.publ_correct")}</h3>
                            <div className="stat-value">{profile.stats.correctRecords}</div>
                        </div>

                        <div className="stat-card">
                            <h3>{t("summary.check_coef")}</h3>
                            <div className="stat-value">{profile.stats.checkRatio.toFixed(2)}</div>
                        </div>

                        <div className="stat-card">
                            <h3>{t("summary.species_found")}</h3>
                            <div className="stat-value">{profile.stats.speciesCount}</div>
                        </div>
                    </div>
                </section>

                <div className="detailed-stats">
                    <section className="common-species">
                        <h3 className="section-subtitle">{t("summary.MVSpecies")}</h3>
                        <div className="species-value">
                            {profile.stats.mostCommonSpecies || t("errors.MVSpecies")}
                        </div>
                    </section>
                </div>

                <section className="records-section">
                    <h2 className="section-title">{t("table.title")}</h2>

                    {profile.records.length > 0 ? (
                        <div className="records-table-container">
                            <div className="table-info">
                                {t("table.displayed")} {sortedRecords.length} {t("table.out_of")} {profile.records.length} {t("table.records")}
                            </div>
                            <table className="records-table">
                                <thead>
                                <tr>
                                    <th onClick={() => requestSort('date')}>
                                        {t("table.cols.date")}
                                        {sortConfig.key === 'date' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('author')}>
                                        {t("table.cols.author")}
                                        {sortConfig.key === 'author' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('species')}>
                                        {t("table.cols.species")}
                                        {sortConfig.key === 'species' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('abundance')}>
                                        {t("table.cols.count")}
                                        {sortConfig.key === 'abundance' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('locality')}>
                                        {t("table.cols.location")}
                                        {sortConfig.key === 'locality' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('even_date')}>
                                        {t("table.cols.collection_date")}
                                        {sortConfig.key === 'even_date' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th>{t("table.cols.actions")}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedRecords.map((record) => (
                                    <tr key={record.hash} data-record-hash={record.hash}>
                                        <td>{new Date(record.date).toLocaleString()}</td>
                                        <td>{record.author}</td>
                                        <td>{record.species}</td>
                                        <td>{record.abundance}</td>
                                        <td>{record.locality}</td>
                                        <td>{record.even_date}</td>
                                        <td className="actions-cell">
                                            <button onClick={() => handleEdit(record.hash)} className="edit-button"
                                                    aria-label="Редактировать запись">
                                                <FaPen/>
                                            </button>
                                            <button onClick={() => handleDelete(record.hash)} className="delete-button"
                                                    aria-label="Удалить запись">
                                                <FaTimes/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-records">{t("table.no_records")}</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;