import React from 'react';
import './TimeSlotPicker.css';

export interface TimeSlot {
  value: string; // HH:MM
  label: string; // e.g. "09:00 AM"
}

const ALL_SLOTS: TimeSlot[] = [
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
];

interface TimeSlotPickerProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  bookedSlots?: string[]; // array of HH:MM strings
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedTime,
  onTimeSelect,
  bookedSlots = [],
}) => {
  const morning = ALL_SLOTS.filter(s => parseInt(s.value) < 12);
  const afternoon = ALL_SLOTS.filter(s => parseInt(s.value) >= 12);

  const renderSlots = (slots: TimeSlot[]) =>
    slots.map(slot => {
      const isBooked = bookedSlots.includes(slot.value);
      const isSelected = slot.value === selectedTime;
      return (
        <button
          key={slot.value}
          className={`time-slot${isBooked ? ' booked' : ''}${isSelected ? ' selected' : ''}`}
          onClick={() => !isBooked && onTimeSelect(slot.value)}
          disabled={isBooked}
          aria-label={`${slot.label}${isBooked ? ' (ocupado)' : ''}`}
          aria-pressed={isSelected}
        >
          {slot.label}
          {isBooked && <span className="booked-badge">✗</span>}
        </button>
      );
    });

  return (
    <div className="time-slot-picker">
      <div className="slot-group">
        <p className="slot-group-label">☀️ Mañana</p>
        <div className="slot-grid">{renderSlots(morning)}</div>
      </div>
      <div className="slot-group">
        <p className="slot-group-label">🌤 Tarde</p>
        <div className="slot-grid">{renderSlots(afternoon)}</div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;
