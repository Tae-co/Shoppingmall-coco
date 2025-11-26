import React from 'react';
import '../../css/admin/AdminComponents.css';

function TagCheckboxGroup({ label, groupName, options, selectedValues, onChange }) {
  return (
    <div className="tag-group">
      <label className="tag-label">{label} (중복 선택 가능)</label>
      <div className="checkbox-container">
        {options.map(opt => (
          <label key={opt.id} className="checkbox-item">
            <input 
              type="checkbox" 
              checked={selectedValues.includes(opt.id)}
              onChange={() => onChange(groupName, opt.id)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default TagCheckboxGroup;