import React from 'react';
import PropTypes from 'prop-types';
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

// Props 타입 정의 추가
TagCheckboxGroup.propTypes = {
  label: PropTypes.string,
  groupName: PropTypes.string,
  options: PropTypes.array.isRequired,
  selectedValues: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default TagCheckboxGroup;