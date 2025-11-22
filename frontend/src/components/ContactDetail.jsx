import { useState } from 'react'
import '../styles/ContactDetail.css'

export default function ContactDetail({ contact, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(contact || {})

  if (!contact) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(contact)
    setIsEditing(false)
  }

  return (
    <div className="contact-detail-overlay" onClick={onClose}>
      <div className="contact-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>×</button>
          <button 
            className={`edit-btn ${isEditing ? 'editing' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'View' : 'Edit'}
          </button>
        </div>

        <div className="contact-header">
          <div className="contact-name-section">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="contact-name-input"
                placeholder="Contact name"
              />
            ) : (
              <h2>{formData.name}</h2>
            )}
            <div className="contact-tabs">
              <button className="tab-btn active">Person</button>
              <button className="tab-btn">Company</button>
            </div>
          </div>
        </div>

        <div className="contact-body">
          <div className="contact-section">
            <h3>Contact Information</h3>
            <div className="info-row">
              <span className="info-label">Email</span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="Email address"
                />
              ) : (
                <span className="info-value">{formData.email || 'Not provided'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="Phone number"
                />
              ) : (
                <span className="info-value">{formData.phone || 'Not provided'}</span>
              )}
            </div>
          </div>

          <div className="contact-section">
            <h3>Company Details</h3>
            <div className="info-row">
              <span className="info-label">Company</span>
              {isEditing ? (
                <input
                  type="text"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="Company name"
                />
              ) : (
                <span className="info-value">{formData.company || 'Not provided'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Job Position</span>
              {isEditing ? (
                <input
                  type="text"
                  name="jobPosition"
                  value={formData.jobPosition || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="Job position"
                />
              ) : (
                <span className="info-value">{formData.jobPosition || 'Not provided'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">GSTIN</span>
              {isEditing ? (
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="GSTIN"
                />
              ) : (
                <span className="info-value">{formData.gstin || 'Not provided'}</span>
              )}
            </div>
          </div>

          <div className="contact-section">
            <h3>Address</h3>
            <div className="info-row">
              <span className="info-label">Street</span>
              {isEditing ? (
                <input
                  type="text"
                  name="street"
                  value={formData.street || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="Street address"
                />
              ) : (
                <span className="info-value">{formData.street || 'Not provided'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">City</span>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="City"
                />
              ) : (
                <span className="info-value">{formData.city || 'Not provided'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">State</span>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="State"
                />
              ) : (
                <span className="info-value">{formData.state || 'Not provided'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">ZIP Code</span>
              {isEditing ? (
                <input
                  type="text"
                  name="zip"
                  value={formData.zip || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="ZIP code"
                />
              ) : (
                <span className="info-value">{formData.zip || 'Not provided'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Country</span>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="Country"
                />
              ) : (
                <span className="info-value">{formData.country || 'Not provided'}</span>
              )}
            </div>
          </div>

          <div className="contact-section">
            <h3>Additional Info</h3>
            <div className="info-row">
              <span className="info-label">Website</span>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="Website URL"
                />
              ) : (
                <span className="info-value">{formData.website || 'Not provided'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Tags</span>
              {isEditing ? (
                <input
                  type="text"
                  name="tags"
                  value={formData.tags || ''}
                  onChange={handleInputChange}
                  className="info-input"
                  placeholder="Tags"
                />
              ) : (
                <span className="info-value">{formData.tags || 'Not provided'}</span>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="contact-actions">
            <button className="btn-primary" onClick={handleSave}>Save Changes</button>
            <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
