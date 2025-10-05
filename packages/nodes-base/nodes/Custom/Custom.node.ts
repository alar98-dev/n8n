import type {
    IExecuteFunctions,
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class Custom implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Custom',
        name: 'custom',
        icon: 'file:markdown.svg',
        group: ['transform'],
        version: 1,
        description:
            'Create a JS/Python-friendly object that holds attributes and method code (method bodies are stored as strings with a language tag)',
        defaults: {
            name: 'Custom',
        },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        properties: [
            {
                displayName: 'Attributes',
                name: 'attributes',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: [],
                placeholder: 'Add Attribute',
                description: 'Key/value pairs to store as object attributes',
                options: [
                    {
                        name: 'attributeValues',
                        displayName: 'Attribute',
                        values: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Attribute name (key) to store',
                            },
                            {
                                displayName: 'Value',
                                name: 'value',
                                type: 'string',
                                default: '',
                                description:
                                    'Value for the attribute (stored as string). You can use expressions to store dynamic values.',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Methods',
                name: 'methods',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: [],
                placeholder: 'Add Method',
                description:
                    'Define method name, language (js or python) and the code body. The code is stored as a string and can be executed by Function / Python nodes downstream.',
                options: [
                    {
                        name: 'methodValues',
                        displayName: 'Method',
                        values: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'Language',
                                name: 'language',
                                type: 'options',
                                options: [
                                    { name: 'JavaScript', value: 'js' },
                                    { name: 'Python', value: 'python' },
                                ],
                                default: 'js',
                            },
                            {
                                displayName: 'Code',
                                name: 'code',
                                type: 'string',
                                typeOptions: { rows: 8 },
                                default: '',
                                description:
                                    'Function body or code to run. For JavaScript provide a function body or expression. For Python provide a function body. The code is stored as a string and can be executed downstream.',
                            },
                        ],
                    },
                ],
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            // attributes is a fixedCollection -> returns an object with key attributeValues
            const attributesCollection = (this.getNodeParameter('attributes', i, []) as IDataObject) || {};
            const attributeValues = (attributesCollection.attributeValues as IDataObject[]) || [];

            const methodsCollection = (this.getNodeParameter('methods', i, []) as IDataObject) || {};
            const methodValues = (methodsCollection.methodValues as IDataObject[]) || [];

            const attributes: IDataObject = {};
            for (const a of attributeValues) {
                if (a && a.name !== undefined) {
                    // store attribute value as given (string). Users can convert types downstream.
                    attributes[String(a.name)] = a.value as string;
                }
            }

            const methods: IDataObject = {};
            for (const m of methodValues) {
                if (m && m.name) {
                    methods[String(m.name)] = {
                        language: m.language || 'js',
                        code: m.code || '',
                    } as IDataObject;
                }
            }

            // Export object under `custom` key so downstream nodes can easily read it
            const customObject: IDataObject = {
                attributes,
                methods,
            };

            returnData.push({ json: { custom: customObject } });
        }

        return [returnData];
    }
}

export default Custom;
