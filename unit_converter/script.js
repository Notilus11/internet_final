class UnitConverter {
    constructor() {
        this.currentCategory = 'length';

        this.units = {
            length: {
                meter: { name: 'Meter (m)', factor: 1 },
                kilometer: { name: 'Kilometer (km)', factor: 0.001 },
                centimeter: { name: 'Centimeter (cm)', factor: 100 },
                millimeter: { name: 'Millimeter (mm)', factor: 1000 },
                mile: { name: 'Mile (mi)', factor: 0.000621371 },
                yard: { name: 'Yard (yd)', factor: 1.09361 },
                foot: { name: 'Foot (ft)', factor: 3.28084 },
                inch: { name: 'Inch (in)', factor: 39.3701 }
            },
            weight: {
                kilogram: { name: 'Kilogram (kg)', factor: 1 },
                gram: { name: 'Gram (g)', factor: 1000 },
                milligram: { name: 'Milligram (mg)', factor: 1000000 },
                ton: { name: 'Metric Ton (t)', factor: 0.001 },
                pound: { name: 'Pound (lb)', factor: 2.20462 },
                ounce: { name: 'Ounce (oz)', factor: 35.274 }
            },
            temperature: {
                celsius: { name: 'Celsius (°C)', factor: null },
                fahrenheit: { name: 'Fahrenheit (°F)', factor: null },
                kelvin: { name: 'Kelvin (K)', factor: null }
            },
            volume: {
                liter: { name: 'Liter (L)', factor: 1 },
                milliliter: { name: 'Milliliter (mL)', factor: 1000 },
                cubicMeter: { name: 'Cubic Meter (m³)', factor: 0.001 },
                gallon: { name: 'Gallon (gal)', factor: 0.264172 },
                quart: { name: 'Quart (qt)', factor: 1.05669 },
                pint: { name: 'Pint (pt)', factor: 2.11338 },
                cup: { name: 'Cup', factor: 4.22675 },
                fluidOunce: { name: 'Fluid Ounce (fl oz)', factor: 33.814 }
            },
            time: {
                second: { name: 'Second (s)', factor: 1 },
                minute: { name: 'Minute (min)', factor: 1 / 60 },
                hour: { name: 'Hour (hr)', factor: 1 / 3600 },
                day: { name: 'Day', factor: 1 / 86400 },
                week: { name: 'Week', factor: 1 / 604800 },
                month: { name: 'Month (30 days)', factor: 1 / 2592000 },
                year: { name: 'Year (365 days)', factor: 1 / 31536000 }
            }
        };

        this.quickReferences = {
            length: [
                '1 km = 1000 m',
                '1 mile = 1.609 km',
                '1 foot = 30.48 cm',
                '1 inch = 2.54 cm'
            ],
            weight: [
                '1 kg = 1000 g',
                '1 lb = 0.453592 kg',
                '1 ton = 1000 kg',
                '1 oz = 28.3495 g'
            ],
            temperature: [
                '°F = (°C × 9/5) + 32',
                '°C = (°F - 32) × 5/9',
                'K = °C + 273.15',
                'Water freezes: 0°C = 32°F = 273.15K'
            ],
            volume: [
                '1 L = 1000 mL',
                '1 gallon = 3.785 L',
                '1 cup = 236.588 mL',
                '1 m³ = 1000 L'
            ],
            time: [
                '1 hour = 60 minutes',
                '1 day = 24 hours',
                '1 week = 7 days',
                '1 year = 365 days'
            ]
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategory(this.currentCategory);
    }

    setupEventListeners() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.loadCategory(this.currentCategory);
            });
        });

        document.getElementById('from-value').addEventListener('input', () => {
            this.convert();
        });

        document.getElementById('from-unit').addEventListener('change', () => {
            this.convert();
        });

        document.getElementById('to-unit').addEventListener('change', () => {
            this.convert();
        });

        document.getElementById('swap-btn').addEventListener('click', () => {
            this.swapUnits();
        });
    }

    loadCategory(category) {
        const fromSelect = document.getElementById('from-unit');
        const toSelect = document.getElementById('to-unit');
        const units = this.units[category];

        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        const unitKeys = Object.keys(units);
        unitKeys.forEach(key => {
            const option1 = document.createElement('option');
            option1.value = key;
            option1.textContent = units[key].name;
            fromSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = key;
            option2.textContent = units[key].name;
            toSelect.appendChild(option2);
        });

        if (unitKeys.length > 1) {
            toSelect.selectedIndex = 1;
        }

        document.getElementById('from-value').value = '';
        document.getElementById('to-value').value = '';
        document.getElementById('formula').textContent = 'Enter a value to convert';

        this.loadQuickReference(category);
    }

    loadQuickReference(category) {
        const refContainer = document.getElementById('quick-reference');
        const references = this.quickReferences[category];

        refContainer.innerHTML = references.map(ref =>
            `<div class="ref-item">${ref}</div>`
        ).join('');
    }

    convert() {
        const fromValue = parseFloat(document.getElementById('from-value').value);
        const fromUnit = document.getElementById('from-unit').value;
        const toUnit = document.getElementById('to-unit').value;

        if (isNaN(fromValue)) {
            document.getElementById('to-value').value = '';
            document.getElementById('formula').textContent = 'Enter a valid number';
            return;
        }

        let result;
        let formula = '';

        if (this.currentCategory === 'temperature') {
            result = this.convertTemperature(fromValue, fromUnit, toUnit);
            formula = this.getTemperatureFormula(fromValue, fromUnit, toUnit);
        } else {
            const fromFactor = this.units[this.currentCategory][fromUnit].factor;
            const toFactor = this.units[this.currentCategory][toUnit].factor;
            result = fromValue * (toFactor / fromFactor);

            const fromName = this.units[this.currentCategory][fromUnit].name;
            const toName = this.units[this.currentCategory][toUnit].name;
            formula = `${fromValue} ${fromName} = ${result.toFixed(6)} ${toName}`;
        }

        document.getElementById('to-value').value = result.toFixed(6);
        document.getElementById('formula').textContent = formula;
    }

    convertTemperature(value, from, to) {
        let celsius;

        // Convert to Celsius first
        if (from === 'celsius') {
            celsius = value;
        } else if (from === 'fahrenheit') {
            celsius = (value - 32) * 5 / 9;
        } else if (from === 'kelvin') {
            celsius = value - 273.15;
        }

        // Convert from Celsius to target
        if (to === 'celsius') {
            return celsius;
        } else if (to === 'fahrenheit') {
            return celsius * 9 / 5 + 32;
        } else if (to === 'kelvin') {
            return celsius + 273.15;
        }
    }

    getTemperatureFormula(value, from, to) {
        const result = this.convertTemperature(value, from, to);
        const fromSymbol = from === 'celsius' ? '°C' : from === 'fahrenheit' ? '°F' : 'K';
        const toSymbol = to === 'celsius' ? '°C' : to === 'fahrenheit' ? '°F' : 'K';

        return `${value}${fromSymbol} = ${result.toFixed(2)}${toSymbol}`;
    }

    swapUnits() {
        const fromUnit = document.getElementById('from-unit');
        const toUnit = document.getElementById('to-unit');
        const fromValue = document.getElementById('from-value');
        const toValue = document.getElementById('to-value');

        // Swap select values
        const tempUnit = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = tempUnit;

        // Swap input values if to-value has a value
        if (toValue.value) {
            fromValue.value = toValue.value;
            this.convert();
        }
    }
}

// Initialize converter when page loads
document.addEventListener('DOMContentLoaded', () => {
    new UnitConverter();
});