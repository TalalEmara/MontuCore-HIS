import React, { useState, useEffect } from 'react';
import BasicOverlay from '../../level-0/Overlay/BasicOverlay';
import styles from './Details.module.css';
import TextInput from '../../level-0/TextInput/TextInput';
import ComboBox from '../../level-0/ComboBox/ComboBox';

export interface TreatmentData {
  id: number | undefined;
  type: string; // 'Surgery', 'Medication'
  description: string;
  providerName: string;
  date: string;
  cost: number;
}

const mockTreatment: TreatmentData = {
  id: 88,
  type: "Surgery",
  description: "Anterior Cruciate Ligament (ACL) Reconstruction using hamstring autograft.",
  providerName: "St. Mary's Surgical Center",
  date: "2024-11-10",
  cost: 15000.00
};

interface TreatmentDetailProps {
  isOpen: boolean;
  onClose: () => void;
  isTakingInput?: boolean;
  treatmentData?: TreatmentData;
  setTreatmentData?: (data: TreatmentData) => void;
}

export default function TreatmentDetail({
  isOpen,
  onClose,
  isTakingInput = false,
  treatmentData,
  setTreatmentData,
}: TreatmentDetailProps) {
  const [formData, setFormData] = useState<TreatmentData>(treatmentData || mockTreatment);

  useEffect(() => {
    if (treatmentData) setFormData(treatmentData);
  }, [treatmentData]);

  const handleChange = (field: keyof TreatmentData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (setTreatmentData) setTreatmentData(updated);
  };

  const typeOptions = [
    { label: "Surgery", value: "Surgery" },
    { label: "Medication", value: "Medication" },
  ];

  return (
    <BasicOverlay isOpen={isOpen} onClose={onClose} title="Treatment Details">
      
      <div className={styles.section}>
        <div className={styles.field}>
          {isTakingInput ? (
            <ComboBox
              label="Type"
              options={typeOptions}
              value={formData.type}
              onChange={(val) => handleChange("type", val)}
            />
          ) : (
            <>
              <span className={styles.label}>Type</span>
              <span className={styles.valueLarge}>{formData.type}</span>
            </>
          )}
        </div>

        <div className={styles.field} style={{ marginTop: '0.5rem' }}>
          {isTakingInput ? (
            <TextInput
              label="Provider"
              value={formData.providerName}
              onChange={(val) => handleChange("providerName", val)}
            />
          ) : (
            <>
              <span className={styles.label}>Provider</span>
              <span>{formData.providerName}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.section}>
        {isTakingInput ? (
          <TextInput
            label="Description"
            value={formData.description}
            onChange={(val) => handleChange("description", val)}
            height={100}
          />
        ) : (
          <>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.text}>{formData.description}</p>
          </>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.grid}>
          <div className={styles.field}>
            {isTakingInput ? (
              <TextInput
                label="Date Performed"
                type="date"
                value={formData.date}
                onChange={(val) => handleChange("date", val)}
              />
            ) : (
              <>
                <span className={styles.label}>Date Performed</span>
                <span>{new Date(formData.date).toLocaleDateString()}</span>
              </>
            )}
          </div>

          <div className={styles.field}>
            {isTakingInput ? (
              <TextInput
                label="Total Cost"
                type="number"
                value={formData.cost.toString()}
                onChange={(val) => handleChange("cost", Number(val))}
              />
            ) : (
              <>
                <span className={styles.label}>Total Cost</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  ${formData.cost.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

    </BasicOverlay>
  );
}
