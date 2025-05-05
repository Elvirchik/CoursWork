// src/components/SortingBar.jsx
import React from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const SortingBar = ({
    priceRange,
    setPriceRange,
    videoCardSeries,
    setVideoCardSeries,
    processors,
    setProcessors,
    ramRange,
    setRamRange,
    storageOptions,
    setStorageOptions,
}) => {
    const handleCheckboxChange = (setter, value) => (event) => {
        if (event.target.checked) {
            setter((prev) => [...prev, value]);
        } else {
            setter((prev) => prev.filter((item) => item !== value));
        }
    };

    const videoCardOptions = ['20 series', '30 series', '40 series', '50 series'];
    const processorOptions = ['Intel', 'AMD'];

    return (
        <div className="sorting-bar">
            <div className="sorting-bar__item">
                <label htmlFor="price-filter">Цена:</label>
                <input
                    type="number"
                    id="price-filter"
                    placeholder="от"
                    min={0}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="до"
                    min={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                />
            </div>

            <Dropdown className="sorting-bar__item">
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-video-card">
                    Видеокарты
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {videoCardOptions.map((series) => (
                        <Dropdown.Item key={series}>
                            <Form.Check
                                type="checkbox"
                                label={series}
                                checked={videoCardSeries.includes(series)}
                                onChange={handleCheckboxChange(setVideoCardSeries, series)}
                            />
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            <Dropdown className="sorting-bar__item">
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-processors">
                    Процессоры
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {processorOptions.map((processor) => (
                        <Dropdown.Item key={processor}>
                            <Form.Check
                                type="checkbox"
                                label={processor}
                                checked={processors.includes(processor)}
                                onChange={handleCheckboxChange(setProcessors, processor)}
                            />
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            <div className="sorting-bar__item">
                <label htmlFor="ram-filter">Оперативная память:</label>
                <input
                    type="number"
                    id="ram-filter"
                    placeholder="от"
                    min={ramRange.min}
                    onChange={(e) => setRamRange({ ...ramRange, min: e.target.value })}
                />
                <input
                    type="number"
                    id="ram-filter"
                    placeholder="до"
                    min={ramRange.min}
                    onChange={(e) => setRamRange({ ...ramRange, max: e.target.value })}
                />
            </div>
            <div className="sorting-bar__item">
                <label htmlFor="storage-filter">Постоянная память:</label>
                <input
                    type="checkbox"
                    id="storage-filter"
                    checked={storageOptions.includes('1TB')}
                    onChange={handleCheckboxChange(setStorageOptions, '1TB')}
                />
                
            </div>
        </div>
    );
};

export default SortingBar;
