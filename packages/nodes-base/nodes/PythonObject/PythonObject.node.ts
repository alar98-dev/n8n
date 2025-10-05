import type {
    IExecuteFunctions,
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class PythonObject implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Python Object',
        name: 'pythonObject',
        icon: 'file:python.svg',
        group: ['transform'],
        version: 1,
        description:
            'Create and manipulate Python objects using Object-Oriented Programming principles: classes, inheritance, encapsulation, polymorphism',
        defaults: {
            name: 'Python Object',
        },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        properties: [
            {
                displayName: 'Object Type',
                name: 'objectType',
                type: 'options',
                options: [
                    { name: 'Class Definition', value: 'classDefinition' },
                    { name: 'Create Instance', value: 'createInstance' },
                    { name: 'Call Method', value: 'callMethod' },
                    { name: 'Access Attribute', value: 'accessAttribute' },
                    { name: 'Inheritance', value: 'inheritance' },
                    { name: 'Polymorphism Demo', value: 'polymorphism' },
                ],
                default: 'classDefinition',
                description: 'Type of object-oriented operation to perform',
            },
            {
                displayName: 'Class Name',
                name: 'className',
                type: 'string',
                default: 'MyClass',
                description: 'Name of the Python class',
            },
            {
                displayName: 'Parent Class',
                name: 'parentClass',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        objectType: ['inheritance'],
                    },
                },
                description: 'Name of the parent class for inheritance (leave empty for no inheritance)',
            },
            {
                displayName: 'Class Attributes',
                name: 'classAttributes',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: [],
                placeholder: 'Add Attribute',
                description: 'Class attributes (static variables shared by all instances)',
                options: [
                    {
                        name: 'attributeValues',
                        displayName: 'Class Attribute',
                        values: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Attribute name',
                            },
                            {
                                displayName: 'Value',
                                name: 'value',
                                type: 'string',
                                default: '',
                                description: 'Attribute value (as Python expression)',
                            },
                            {
                                displayName: 'Access Level',
                                name: 'accessLevel',
                                type: 'options',
                                options: [
                                    { name: 'Public', value: 'public' },
                                    { name: 'Protected (_)', value: 'protected' },
                                    { name: 'Private (__)', value: 'private' },
                                ],
                                default: 'public',
                                description: 'Encapsulation level of the attribute',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Instance Attributes',
                name: 'instanceAttributes',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: [],
                placeholder: 'Add Instance Attribute',
                description: 'Instance attributes (unique to each object instance)',
                options: [
                    {
                        name: 'attributeValues',
                        displayName: 'Instance Attribute',
                        values: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Attribute name',
                            },
                            {
                                displayName: 'Default Value',
                                name: 'defaultValue',
                                type: 'string',
                                default: 'None',
                                description: 'Default value for __init__ parameter',
                            },
                            {
                                displayName: 'Access Level',
                                name: 'accessLevel',
                                type: 'options',
                                options: [
                                    { name: 'Public', value: 'public' },
                                    { name: 'Protected (_)', value: 'protected' },
                                    { name: 'Private (__)', value: 'private' },
                                ],
                                default: 'public',
                                description: 'Encapsulation level of the attribute',
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
                description: 'Class methods (functions that operate on the object)',
                options: [
                    {
                        name: 'methodValues',
                        displayName: 'Method',
                        values: [
                            {
                                displayName: 'Method Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Name of the method',
                            },
                            {
                                displayName: 'Parameters',
                                name: 'parameters',
                                type: 'string',
                                default: 'self',
                                description: 'Method parameters (e.g., "self, param1, param2=default")',
                            },
                            {
                                displayName: 'Method Body',
                                name: 'body',
                                type: 'string',
                                typeOptions: { rows: 8 },
                                default: '    """Method docstring"""\n    pass',
                                description: 'Python code for the method body (use proper indentation)',
                            },
                            {
                                displayName: 'Method Type',
                                name: 'methodType',
                                type: 'options',
                                options: [
                                    { name: 'Instance Method', value: 'instance' },
                                    { name: 'Class Method (@classmethod)', value: 'classmethod' },
                                    { name: 'Static Method (@staticmethod)', value: 'staticmethod' },
                                    { name: 'Property (@property)', value: 'property' },
                                ],
                                default: 'instance',
                                description: 'Type of method',
                            },
                            {
                                displayName: 'Access Level',
                                name: 'accessLevel',
                                type: 'options',
                                options: [
                                    { name: 'Public', value: 'public' },
                                    { name: 'Protected (_)', value: 'protected' },
                                    { name: 'Private (__)', value: 'private' },
                                ],
                                default: 'public',
                                description: 'Encapsulation level of the method',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Constructor (__init__)',
                name: 'constructor',
                type: 'string',
                typeOptions: { rows: 6 },
                default: '    """Initialize the object"""\n    pass',
                description: 'Custom constructor code (will be added to __init__ method)',
            },
            {
                displayName: 'Instance Creation',
                name: 'instanceCreation',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: [],
                displayOptions: {
                    show: {
                        objectType: ['createInstance'],
                    },
                },
                options: [
                    {
                        name: 'instances',
                        displayName: 'Instance',
                        values: [
                            {
                                displayName: 'Instance Name',
                                name: 'name',
                                type: 'string',
                                default: 'obj1',
                                description: 'Variable name for the instance',
                            },
                            {
                                displayName: 'Constructor Args',
                                name: 'args',
                                type: 'string',
                                default: '',
                                description: 'Arguments to pass to __init__ (e.g., "arg1, arg2=value")',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Method Calls',
                name: 'methodCalls',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: [],
                displayOptions: {
                    show: {
                        objectType: ['callMethod'],
                    },
                },
                options: [
                    {
                        name: 'calls',
                        displayName: 'Method Call',
                        values: [
                            {
                                displayName: 'Instance Name',
                                name: 'instanceName',
                                type: 'string',
                                default: 'obj1',
                                description: 'Name of the instance to call method on',
                            },
                            {
                                displayName: 'Method Name',
                                name: 'methodName',
                                type: 'string',
                                default: '',
                                description: 'Name of the method to call',
                            },
                            {
                                displayName: 'Arguments',
                                name: 'arguments',
                                type: 'string',
                                default: '',
                                description: 'Arguments to pass to the method',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Include Documentation',
                name: 'includeDocumentation',
                type: 'boolean',
                default: true,
                description: 'Include docstrings and comments in generated code',
            },
            {
                displayName: 'Generate Example Usage',
                name: 'generateExample',
                type: 'boolean',
                default: true,
                description: 'Generate example code showing how to use the class',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const objectType = this.getNodeParameter('objectType', i) as string;
            const className = this.getNodeParameter('className', i) as string;
            const includeDocumentation = this.getNodeParameter('includeDocumentation', i) as boolean;
            const generateExample = this.getNodeParameter('generateExample', i) as boolean;

            let result: IDataObject = {
                objectType,
                className,
            };

            switch (objectType) {
                case 'classDefinition':
                case 'inheritance':
                    result = PythonObject.generateClassDefinition(this, i, includeDocumentation);
                    break;

                case 'createInstance':
                    result = PythonObject.generateInstanceCreation(this, i);
                    break;

                case 'callMethod':
                    result = PythonObject.generateMethodCalls(this, i);
                    break;

                case 'accessAttribute':
                    result = PythonObject.generateAttributeAccess(this, i);
                    break;

                case 'polymorphism':
                    result = PythonObject.generatePolymorphismDemo(this, i);
                    break;
            }

            // Add example usage if requested
            if (generateExample && objectType === 'classDefinition') {
                result.exampleUsage = PythonObject.generateExampleUsage(className);
            }

            // Merge with input data
            const outputData: IDataObject = {
                ...items[i].json,
                pythonObject: result,
            };

            returnData.push({ json: outputData });
        }

        return [returnData];
    }

    private static generateClassDefinition(executeFunctions: IExecuteFunctions, itemIndex: number, includeDocumentation: boolean): IDataObject {
        const className = executeFunctions.getNodeParameter('className', itemIndex) as string;
        const parentClass = executeFunctions.getNodeParameter('parentClass', itemIndex, '') as string;
        const classAttributes = executeFunctions.getNodeParameter('classAttributes', itemIndex, {}) as IDataObject;
        const instanceAttributes = executeFunctions.getNodeParameter('instanceAttributes', itemIndex, {}) as IDataObject;
        const methods = executeFunctions.getNodeParameter('methods', itemIndex, {}) as IDataObject;
        const constructor = executeFunctions.getNodeParameter('constructor', itemIndex) as string;

        const classAttrs = (classAttributes.attributeValues as IDataObject[]) || [];
        const instanceAttrs = (instanceAttributes.attributeValues as IDataObject[]) || [];
        const methodList = (methods.methodValues as IDataObject[]) || [];

        let pythonCode = '';
        
        // Class declaration
        const inheritance = parentClass ? `(${parentClass})` : '';
        pythonCode += `class ${className}${inheritance}:\n`;
        
        if (includeDocumentation) {
            pythonCode += `    """${className} - A Python class demonstrating OOP principles"""\n\n`;
        }

        // Class attributes
        if (classAttrs.length > 0) {
            if (includeDocumentation) {
                pythonCode += '    # Class attributes (shared by all instances)\n';
            }
            for (const attr of classAttrs) {
                const attrName = PythonObject.formatAttributeName(attr.name as string, attr.accessLevel as string);
                pythonCode += `    ${attrName} = ${attr.value}\n`;
            }
            pythonCode += '\n';
        }

        // Constructor
        const initParams = instanceAttrs.map(attr => {
            const paramName = attr.name as string;
            const defaultValue = attr.defaultValue as string;
            return defaultValue !== 'None' ? `${paramName}=${defaultValue}` : paramName;
        }).join(', ');

        const fullInitParams = instanceAttrs.length > 0 ? `self, ${initParams}` : 'self';
        pythonCode += `    def __init__(${fullInitParams}):\n`;
        
        if (includeDocumentation) {
            pythonCode += `        """Initialize ${className} instance"""\n`;
        }

        // Initialize instance attributes
        for (const attr of instanceAttrs) {
            const attrName = PythonObject.formatAttributeName(attr.name as string, attr.accessLevel as string);
            pythonCode += `        self.${attrName} = ${attr.name}\n`;
        }

        // Add custom constructor code
        if (constructor.trim()) {
            pythonCode += `\n${constructor}\n`;
        }

        pythonCode += '\n';

        // Methods
        for (const method of methodList) {
            const methodName = PythonObject.formatAttributeName(method.name as string, method.accessLevel as string);
            const methodType = method.methodType as string;
            const parameters = method.parameters as string;
            const body = method.body as string;

            // Add decorators
            if (methodType === 'classmethod') {
                pythonCode += '    @classmethod\n';
            } else if (methodType === 'staticmethod') {
                pythonCode += '    @staticmethod\n';
            } else if (methodType === 'property') {
                pythonCode += '    @property\n';
            }

            pythonCode += `    def ${methodName}(${parameters}):\n`;
            pythonCode += `${body}\n\n`;
        }

        // Add special methods if not already defined
        if (!methodList.some(m => m.name === '__str__')) {
            pythonCode += '    def __str__(self):\n';
            pythonCode += `        """String representation of ${className}"""\n`;
            pythonCode += `        return f"${className}({', '.join(f'{attr}={{getattr(self, attr)}}' for attr in vars(self))})"\n\n`;
        }

        if (!methodList.some(m => m.name === '__repr__')) {
            pythonCode += '    def __repr__(self):\n';
            pythonCode += `        """Developer representation of ${className}"""\n`;
            pythonCode += '        return self.__str__()\n\n';
        }

        return {
            objectType: 'classDefinition',
            className,
            parentClass: parentClass || null,
            pythonCode,
            classAttributes: classAttrs,
            instanceAttributes: instanceAttrs,
            methods: methodList,
            principlesUsed: [
                'Encapsulation (private, protected, public members)',
                'Abstraction (methods hide implementation details)',
                parentClass ? 'Inheritance (extends parent class)' : null,
                'Composition (attributes can be complex objects)',
            ].filter(Boolean),
        };
    }

    private static generateInstanceCreation(executeFunctions: IExecuteFunctions, itemIndex: number): IDataObject {
        const className = executeFunctions.getNodeParameter('className', itemIndex) as string;
        const instanceCreation = executeFunctions.getNodeParameter('instanceCreation', itemIndex, {}) as IDataObject;
        const instances = (instanceCreation.instances as IDataObject[]) || [];

        let pythonCode = '# Creating instances of the class\n';
        const createdInstances: IDataObject[] = [];

        for (const instance of instances) {
            const instanceName = instance.name as string;
            const args = instance.args as string;
            
            pythonCode += `${instanceName} = ${className}(${args})\n`;
            pythonCode += `print(f"Created instance: {${instanceName}}")\n\n`;

            createdInstances.push({
                name: instanceName,
                className,
                constructorArgs: args,
                creationCode: `${instanceName} = ${className}(${args})`,
            });
        }

        return {
            objectType: 'createInstance',
            className,
            pythonCode,
            instances: createdInstances,
            principlesUsed: ['Object Instantiation', 'Constructor Invocation'],
        };
    }

    private static generateMethodCalls(executeFunctions: IExecuteFunctions, itemIndex: number): IDataObject {
        const methodCalls = executeFunctions.getNodeParameter('methodCalls', itemIndex, {}) as IDataObject;
        const calls = (methodCalls.calls as IDataObject[]) || [];

        let pythonCode = '# Calling methods on instances\n';
        const executedCalls: IDataObject[] = [];

        for (const call of calls) {
            const instanceName = call.instanceName as string;
            const methodName = call.methodName as string;
            const args = call.arguments as string;
            const argsStr = args ? `(${args})` : '()';

            pythonCode += `result = ${instanceName}.${methodName}${argsStr}\n`;
            pythonCode += `print(f"${instanceName}.${methodName}${argsStr} = {result}")\n\n`;

            executedCalls.push({
                instance: instanceName,
                method: methodName,
                arguments: args,
                callCode: `${instanceName}.${methodName}${argsStr}`,
            });
        }

        return {
            objectType: 'callMethod',
            pythonCode,
            methodCalls: executedCalls,
            principlesUsed: ['Method Invocation', 'Polymorphism (same method, different behavior)'],
        };
    }

    private static generateAttributeAccess(executeFunctions: IExecuteFunctions, itemIndex: number): IDataObject {
        const className = executeFunctions.getNodeParameter('className', itemIndex) as string;

        const pythonCode = `# Accessing and modifying attributes
# Demonstrating encapsulation principles

# Public attribute access
print(f"Public attribute: {obj.public_attr}")
obj.public_attr = "new_value"

# Protected attribute access (convention: use with caution)
print(f"Protected attribute: {obj._protected_attr}")

# Private attribute access (name mangling)
try:
    print(f"Private attribute: {obj.__private_attr}")  # This will fail
except AttributeError as e:
    print(f"Cannot access private attribute: {e}")
    print(f"Accessing via name mangling: {obj._${className}__private_attr}")

# Using property methods for controlled access
if hasattr(obj, 'controlled_property'):
    print(f"Property value: {obj.controlled_property}")
    obj.controlled_property = "new_property_value"
`;

        return {
            objectType: 'accessAttribute',
            className,
            pythonCode,
            principlesUsed: [
                'Encapsulation (public, protected, private access)',
                'Name Mangling (Python private attribute mechanism)',
                'Properties (controlled attribute access)',
                'Error Handling (graceful attribute access)',
            ],
        };
    }

    private static generatePolymorphismDemo(executeFunctions: IExecuteFunctions, itemIndex: number): IDataObject {
        const className = executeFunctions.getNodeParameter('className', itemIndex) as string;

        const pythonCode = `# Polymorphism demonstration
# Multiple classes with same interface, different implementations

class Animal:
    """Base class demonstrating polymorphism"""
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        """Abstract method to be overridden"""
        raise NotImplementedError("Subclass must implement speak()")
    
    def info(self):
        """Common method for all animals"""
        return f"I am {self.name}"

class Dog(Animal):
    """Dog implementation of Animal"""
    def speak(self):
        return f"{self.name} says Woof!"
    
    def fetch(self):
        return f"{self.name} fetches the ball!"

class Cat(Animal):
    """Cat implementation of Animal"""
    def speak(self):
        return f"{self.name} says Meow!"
    
    def climb(self):
        return f"{self.name} climbs the tree!"

class Bird(Animal):
    """Bird implementation of Animal"""
    def speak(self):
        return f"{self.name} says Chirp!"
    
    def fly(self):
        return f"{self.name} flies in the sky!"

# Polymorphism in action
animals = [
    Dog("Buddy"),
    Cat("Whiskers"), 
    Bird("Tweety")
]

print("=== Polymorphism Demo ===")
for animal in animals:
    print(f"{animal.info()} - {animal.speak()}")

# Duck typing - if it walks like a duck and quacks like a duck...
def make_animal_speak(animal):
    """Function that works with any object that has a speak() method"""
    return animal.speak()

print("\\n=== Duck Typing ===")
for animal in animals:
    print(make_animal_speak(animal))
`;

        return {
            objectType: 'polymorphism',
            className,
            pythonCode,
            principlesUsed: [
                'Polymorphism (same interface, different implementations)',
                'Inheritance (Dog, Cat, Bird inherit from Animal)',
                'Method Overriding (each animal implements speak() differently)',
                'Duck Typing (Python\'s dynamic typing system)',
                'Abstract Methods (base class defines interface)',
            ],
            concepts: {
                polymorphism: 'Multiple classes implementing the same interface differently',
                inheritance: 'Child classes inheriting from parent class',
                overriding: 'Child classes providing specific implementations',
                duckTyping: 'If it has the right methods, it can be used polymorphically',
            },
        };
    }

    private static generateExampleUsage(className: string): string {
        return `# Example usage of ${className}
# This demonstrates how to use the class in a real scenario

# 1. Create instances
obj1 = ${className}()
obj2 = ${className}()

# 2. Call methods
obj1.some_method()
result = obj2.another_method("parameter")

# 3. Access attributes
print(obj1.public_attribute)
obj1.public_attribute = "new_value"

# 4. Demonstrate object identity
print(f"obj1 is obj2: {obj1 is obj2}")  # False - different instances
print(f"obj1 == obj2: {obj1 == obj2}")  # Depends on __eq__ implementation

# 5. Show object lifecycle
print(f"obj1: {obj1}")  # Uses __str__ method
del obj2  # Object cleanup
`;
    }

    private static formatAttributeName(name: string, accessLevel: string): string {
        switch (accessLevel) {
            case 'protected':
                return name.startsWith('_') ? name : `_${name}`;
            case 'private':
                return name.startsWith('__') ? name : `__${name}`;
            default:
                return name;
        }
    }
}

export default PythonObject;