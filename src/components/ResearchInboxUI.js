import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ResearchPaperModal from './ResearchPaperModal';
import ResearchPaperDetails from './ResearchPaperDetails';
import { usePapers } from '../hooks/usePapers';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useIntl } from 'react-intl';

interface ResearchPaperCardProps {
  paper: any;
  isUnread: boolean;
  handlePaperClick: (paperId: string) => void;
}

const ResearchPaperCard: React.FC<ResearchPaperCardProps> = ({ paper, isUnread, handlePaperClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const navigate = useNavigate();
  const { papers } = usePapers();
  const user = useSelector((state: RootState) => state.auth.user);
  const intl = useIntl();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePaperDetails = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDetailsVisible(!detailsVisible);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCardClick = () => {
    if (user) {
      handlePaperClick(paper.id);
    } else {
      navigate('/login');
    }
  };

  const researchPaperTitle = (paper: any) => {
    if (paper.title) {
      return paper.title;
    } else {
      return intl.formatMessage({ id: 'unknown_title' });
    }
  };

  const researchPaperAuthors = (paper: any) => {
    if (paper.authors && paper.authors.length > 0) {
      return paper.authors.join(', ');
    } else {
      return intl.formatMessage({ id: 'unknown_authors' });
    }
  };

  const researchPaperStatus = (paper: any) => {
    if (paper.status) {
      return paper.status;
    } else {
      return intl.formatMessage({ id: 'unknown_status' });
    }
  };

  const researchPaperAbstract = (paper: any) => {
    if (paper.abstract) {
      return paper.abstract;
    } else {
      return intl.formatMessage({ id: 'unknown_abstract' });
    }
  };

  const researchPaperKeywords = (paper: any) => {
    if (paper.keywords && paper.keywords.length > 0) {
      return paper.keywords.join(', ');
    } else {
      return intl.formatMessage({ id: 'unknown_keywords' });
    }
  };

  return (
    <div className={`research-paper-card ${isUnread ? 'unread' : ''}`} onClick={handleCardClick}>
      <div className="paper-header">
        <div className="paper-title">
          {researchPaperTitle(paper)}
          {isUnread && (
            <div className="unread-indicator" aria-label={intl.formatMessage({ id: 'unread_paper' })}>
              {intl.formatMessage({ id: 'unread' })}
            </div>
          )}
        </div>
        <div className="paper-authors">
          {researchPaperAuthors(paper)}
        </div>
      </div>
      <div className="paper-status">
        {researchPaperStatus(paper)}
      </div>
      <div className="paper-abstract">
        {researchPaperAbstract(paper)}
      </div>
      <div className="paper-keywords">
        {researchPaperKeywords(paper)}
      </div>
      <div className="paper-actions">
        <button onClick={handlePaperDetails} className="details-button">
          <Icon icon="mdi:details" />
        </button>
        <button onClick={() => setIsModalOpen(true)} className="modal-button">
          <Icon icon="mdi:open-in-new" />
        </button>
      </div>
      {detailsVisible && <ResearchPaperDetails paper={paper} />}
      {isModalOpen && <ResearchPaperModal paper={paper} onClose={handleModalClose} />}
    </div>
  );
};

export default ResearchPaperCard;