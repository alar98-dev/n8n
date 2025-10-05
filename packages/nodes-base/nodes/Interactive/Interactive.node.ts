import type {
    IExecuteFunctions,
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class Interactive implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Interactive',
        name: 'interactive',
        icon: 'file:interactive.svg',
        group: ['input'],
        version: 1,
        description:
            'Create interactive elements that can be configured and manipulated directly in the n8n editor interface',
        defaults: {
            name: 'Interactive',
        },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        properties: [
            {
                displayName: 'Interactive Type',
                name: 'interactiveType',
                type: 'options',
                options: [
                    { name: 'Button Click', value: 'button' },
                    { name: 'Text Input', value: 'textInput' },
                    { name: 'Number Input', value: 'numberInput' },
                    { name: 'Dropdown Selection', value: 'dropdown' },
                    { name: 'Checkbox', value: 'checkbox' },
                    { name: 'Date Picker', value: 'datePicker' },
                    { name: 'Color Picker', value: 'colorPicker' },
                ],
                default: 'button',
                description: 'Type of interactive element to create',
            },
            {
                displayName: 'Label',
                name: 'label',
                type: 'string',
                default: 'Interactive Element',
                description: 'Label/title for the interactive element',
            },
            {
                displayName: 'Button Text',
                name: 'buttonText',
                type: 'string',
                default: 'Click Me',
                displayOptions: {
                    show: {
                        interactiveType: ['button'],
                    },
                },
                description: 'Text displayed on the button',
            },
            {
                displayName: 'Button Action',
                name: 'buttonAction',
                type: 'options',
                options: [
                    { name: 'Generate Timestamp', value: 'timestamp' },
                    { name: 'Generate UUID', value: 'uuid' },
                    { name: 'Increment Counter', value: 'counter' },
                    { name: 'Custom Message', value: 'custom' },
                ],
                default: 'timestamp',
                displayOptions: {
                    show: {
                        interactiveType: ['button'],
                    },
                },
                description: 'Action to perform when button is clicked',
            },
            {
                displayName: 'Custom Message',
                name: 'customMessage',
                type: 'string',
                default: 'Button was clicked!',
                displayOptions: {
                    show: {
                        interactiveType: ['button'],
                        buttonAction: ['custom'],
                    },
                },
                description: 'Custom message to return when button is clicked',
            },
            {
                displayName: 'Input Value',
                name: 'inputValue',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        interactiveType: ['textInput'],
                    },
                },
                description: 'Current value of the text input (you can type here and it will be captured)',
            },
            {
                displayName: 'Number Value',
                name: 'numberValue',
                type: 'number',
                default: 0,
                displayOptions: {
                    show: {
                        interactiveType: ['numberInput'],
                    },
                },
                description: 'Current numeric value (adjust using the number input)',
            },
            {
                displayName: 'Dropdown Options',
                name: 'dropdownOptions',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: {
                    options: [
                        { name: 'Option 1', value: 'opt1' },
                        { name: 'Option 2', value: 'opt2' },
                        { name: 'Option 3', value: 'opt3' },
                    ],
                },
                displayOptions: {
                    show: {
                        interactiveType: ['dropdown'],
                    },
                },
                options: [
                    {
                        name: 'options',
                        displayName: 'Option',
                        values: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Display name for the option',
                            },
                            {
                                displayName: 'Value',
                                name: 'value',
                                type: 'string',
                                default: '',
                                description: 'Value to return when this option is selected',
                            },
                        ],
                    },
                ],
                description: 'Available options for the dropdown',
            },
            {
                displayName: 'Selected Option',
                name: 'selectedOption',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        interactiveType: ['dropdown'],
                    },
                },
                description: 'Currently selected option value',
            },
            {
                displayName: 'Checkbox Checked',
                name: 'checkboxChecked',
                type: 'boolean',
                default: false,
                displayOptions: {
                    show: {
                        interactiveType: ['checkbox'],
                    },
                },
                description: 'Current state of the checkbox (check/uncheck to change)',
            },
            {
                displayName: 'Selected Date',
                name: 'selectedDate',
                type: 'dateTime',
                default: '',
                displayOptions: {
                    show: {
                        interactiveType: ['datePicker'],
                    },
                },
                description: 'Currently selected date and time',
            },
            {
                displayName: 'Selected Color',
                name: 'selectedColor',
                type: 'color',
                default: '#3498db',
                displayOptions: {
                    show: {
                        interactiveType: ['colorPicker'],
                    },
                },
                description: 'Currently selected color (click to change)',
            },
            {
                displayName: 'Include Metadata',
                name: 'includeMetadata',
                type: 'boolean',
                default: true,
                description: 'Include additional metadata like timestamp, user interaction count, etc.',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const interactiveType = this.getNodeParameter('interactiveType', i) as string;
            const label = this.getNodeParameter('label', i) as string;
            const includeMetadata = this.getNodeParameter('includeMetadata', i) as boolean;

            let interactionData: IDataObject = {
                type: interactiveType,
                label,
            };

            // Process based on interactive type
            switch (interactiveType) {
                case 'button':
                    const buttonText = this.getNodeParameter('buttonText', i) as string;
                    const buttonAction = this.getNodeParameter('buttonAction', i) as string;

                    interactionData.buttonText = buttonText;
                    interactionData.action = buttonAction;

                    // Perform button action
                    switch (buttonAction) {
                        case 'timestamp':
                            interactionData.result = new Date().toISOString();
                            break;
                        case 'uuid':
                            interactionData.result = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                            break;
                        case 'counter':
                            // Simple counter that increments each time (in real implementation, this could be stored)
                            interactionData.result = Math.floor(Math.random() * 1000) + 1;
                            break;
                        case 'custom':
                            const customMessage = this.getNodeParameter('customMessage', i) as string;
                            interactionData.result = customMessage;
                            break;
                    }
                    break;

                case 'textInput':
                    const inputValue = this.getNodeParameter('inputValue', i) as string;
                    interactionData.value = inputValue;
                    interactionData.length = inputValue.length;
                    interactionData.wordCount = inputValue.trim().split(/\s+/).filter(word => word.length > 0).length;
                    break;

                case 'numberInput':
                    const numberValue = this.getNodeParameter('numberValue', i) as number;
                    interactionData.value = numberValue;
                    interactionData.isPositive = numberValue > 0;
                    interactionData.isEven = numberValue % 2 === 0;
                    break;

                case 'dropdown':
                    const dropdownOptions = this.getNodeParameter('dropdownOptions', i) as IDataObject;
                    const selectedOption = this.getNodeParameter('selectedOption', i) as string;
                    const options = (dropdownOptions.options as IDataObject[]) || [];
                    
                    interactionData.selectedValue = selectedOption;
                    interactionData.availableOptions = options;
                    interactionData.selectedOptionDetails = options.find(opt => opt.value === selectedOption);
                    break;

                case 'checkbox':
                    const checkboxChecked = this.getNodeParameter('checkboxChecked', i) as boolean;
                    interactionData.checked = checkboxChecked;
                    interactionData.status = checkboxChecked ? 'enabled' : 'disabled';
                    break;

                case 'datePicker':
                    const selectedDate = this.getNodeParameter('selectedDate', i) as string;
                    if (selectedDate) {
                        const date = new Date(selectedDate);
                        interactionData.selectedDate = selectedDate;
                        interactionData.dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                        interactionData.month = date.toLocaleDateString('en-US', { month: 'long' });
                        interactionData.year = date.getFullYear();
                        interactionData.isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    }
                    break;

                case 'colorPicker':
                    const selectedColor = this.getNodeParameter('selectedColor', i) as string;
                    interactionData.color = selectedColor;
                    interactionData.hexValue = selectedColor;
                    // Convert hex to RGB (basic conversion)
                    const hex = selectedColor.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    interactionData.rgb = { r, g, b };
                    interactionData.brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000);
                    break;
            }

            // Add metadata if requested
            if (includeMetadata) {
                interactionData.metadata = {
                    timestamp: new Date().toISOString(),
                    executionId: this.getExecutionId(),
                    nodeId: this.getNode().id,
                    itemIndex: i,
                    totalItems: items.length,
                };
            }

            // Merge with input data
            const outputData: IDataObject = {
                ...items[i].json,
                interactive: interactionData,
            };

            returnData.push({ json: outputData });
        }

        return [returnData];
    }
}

export default Interactive;