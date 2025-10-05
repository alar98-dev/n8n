# Python Object Node

## Descrição

O **Python Object** é um node especializado para criação e manipulação de objetos Python seguindo os princípios fundamentais da **Programação Orientada a Objetos (POO)**:

- **Encapsulamento**: Controle de acesso (público, protegido, privado)
- **Herança**: Criação de classes filhas que herdam de classes pai
- **Polimorfismo**: Mesma interface, comportamentos diferentes
- **Abstração**: Ocultação de detalhes de implementação

## Funcionalidades Principais

### 1. **Definição de Classes** (`Class Definition`)
Cria classes Python completas com:
- Atributos de classe (compartilhados por todas as instâncias)
- Atributos de instância (únicos para cada objeto)
- Métodos (instance, class, static, property)
- Construtor personalizado (`__init__`)
- Níveis de encapsulamento (público, protegido, privado)

### 2. **Herança** (`Inheritance`)
Demonstra herança de classes:
- Definição de classe pai
- Criação de classes filhas
- Sobrescrita de métodos
- Extensão de funcionalidades

### 3. **Criação de Instâncias** (`Create Instance`)
Gera código para instanciar objetos:
- Múltiplas instâncias
- Parâmetros do construtor
- Inicialização de atributos

### 4. **Chamada de Métodos** (`Call Method`)
Executa métodos em instâncias:
- Chamadas com parâmetros
- Captura de retornos
- Demonstração de polimorfismo

### 5. **Acesso a Atributos** (`Access Attribute`)
Manipula atributos de objetos:
- Acesso público, protegido e privado
- Name mangling do Python
- Uso de properties

### 6. **Demonstração de Polimorfismo** (`Polymorphism Demo`)
Exemplo completo de polimorfismo:
- Classes com mesma interface
- Implementações diferentes
- Duck typing

## Configuração dos Atributos

### Atributos de Classe
```json
{
  "name": "contador",
  "value": "0",
  "accessLevel": "public"
}
```

### Atributos de Instância
```json
{
  "name": "nome",
  "defaultValue": "\"Sem nome\"",
  "accessLevel": "private"
}
```

### Métodos
```json
{
  "name": "calcular",
  "parameters": "self, x, y=0",
  "body": "    \"\"\"Calcula soma de x e y\"\"\"\n    return x + y",
  "methodType": "instance",
  "accessLevel": "public"
}
```

## Exemplos de Uso

### Exemplo 1: Classe Pessoa Simples

**Configuração:**
- Object Type: `Class Definition`
- Class Name: `Pessoa`
- Instance Attributes: `nome`, `idade`, `email`
- Methods: `apresentar()`, `aniversario()`

**Resultado:**
```python
class Pessoa:
    """Pessoa - A Python class demonstrating OOP principles"""

    def __init__(self, nome, idade, email="sem@email.com"):
        """Initialize Pessoa instance"""
        self.nome = nome
        self.idade = idade
        self.email = email

    def apresentar(self):
        """Apresenta a pessoa"""
        return f"Olá! Eu sou {self.nome}, tenho {self.idade} anos"

    def aniversario(self):
        """Incrementa a idade"""
        self.idade += 1
        return f"Feliz aniversário! Agora tenho {self.idade} anos"
```

### Exemplo 2: Herança - Funcionário herda de Pessoa

**Configuração:**
- Object Type: `Inheritance`
- Class Name: `Funcionario`
- Parent Class: `Pessoa`
- Additional Attributes: `cargo`, `salario`

**Resultado:**
```python
class Funcionario(Pessoa):
    """Funcionario - A Python class demonstrating OOP principles"""

    def __init__(self, nome, idade, email, cargo, salario):
        """Initialize Funcionario instance"""
        super().__init__(nome, idade, email)
        self.cargo = cargo
        self.__salario = salario  # Atributo privado

    def apresentar(self):
        """Sobrescreve método da classe pai"""
        return f"Olá! Eu sou {self.nome}, trabalho como {self.cargo}"

    def get_salario(self):
        """Método para acessar salário privado"""
        return self.__salario
```

### Exemplo 3: Polimorfismo - Animais

```python
# Classes com mesma interface, comportamentos diferentes
class Animal:
    def __init__(self, nome):
        self.nome = nome
    
    def falar(self):
        raise NotImplementedError("Subclass must implement falar()")

class Cachorro(Animal):
    def falar(self):
        return f"{self.nome} faz Au au!"

class Gato(Animal):
    def falar(self):
        return f"{self.nome} faz Miau!"

# Polimorfismo em ação
animais = [Cachorro("Rex"), Gato("Mimi")]
for animal in animais:
    print(animal.falar())  # Comportamento diferente para cada tipo
```

## Integração com Function Nodes

### Uso em Python Function Node

```python
# Usando o código gerado pelo Python Object node
exec(items[0]['pythonObject']['pythonCode'])

# Criando instâncias
pessoa1 = Pessoa("João", 30, "joao@email.com")
pessoa2 = Pessoa("Maria", 25)

# Chamando métodos
resultado1 = pessoa1.apresentar()
pessoa1.aniversario()

# Retornando dados estruturados
return [
    {
        'json': {
            'pessoa1': {
                'nome': pessoa1.nome,
                'idade': pessoa1.idade,
                'apresentacao': resultado1
            },
            'pessoa2': {
                'nome': pessoa2.nome,
                'idade': pessoa2.idade,
                'apresentacao': pessoa2.apresentar()
            }
        }
    }
]
```

### Uso em JavaScript Function Node

```javascript
// Executando código Python via subprocess ou similar
const pythonCode = items[0].pythonObject.pythonCode;
const classDefinition = items[0].pythonObject;

// Criando estrutura de dados baseada na classe Python
const createInstance = (className, attributes) => {
  const instance = { _className: className };
  attributes.forEach(attr => {
    instance[attr.name] = attr.defaultValue;
  });
  return instance;
};

// Simulando instância
const pessoa = createInstance(
  classDefinition.className,
  classDefinition.instanceAttributes
);

return [{ json: { pythonObject: classDefinition, instance: pessoa } }];
```

## Princípios OOP Implementados

### 1. **Encapsulamento**
- Atributos públicos: `atributo`
- Atributos protegidos: `_atributo` 
- Atributos privados: `__atributo`
- Properties para controle de acesso

### 2. **Herança**
- Classes filhas herdam de classes pai
- Método `super()` para chamar implementação da classe pai
- Sobrescrita de métodos (`override`)

### 3. **Polimorfismo**
- Mesma interface, implementações diferentes
- Duck typing do Python
- Métodos abstratos na classe base

### 4. **Abstração**
- Métodos ocultam detalhes de implementação
- Interfaces bem definidas
- Documentação clara com docstrings

## Casos de Uso Reais

1. **Sistema de Usuários**: Classes User, Admin, Cliente com diferentes permissões
2. **E-commerce**: Produto, ProdutoFisico, ProdutoDigital com diferentes comportamentos
3. **Processamento de Dados**: Reader, CSVReader, JSONReader com interface comum
4. **APIs**: BaseAPI, RestAPI, GraphQLAPI com métodos específicos
5. **Jogos**: Personagem, Guerreiro, Mago com habilidades diferentes

## Saída de Dados

O node retorna um objeto estruturado contendo:

```json
{
  "pythonObject": {
    "objectType": "classDefinition",
    "className": "MinhaClasse",
    "pythonCode": "class MinhaClasse:\n    ...",
    "classAttributes": [...],
    "instanceAttributes": [...],
    "methods": [...],
    "principlesUsed": [
      "Encapsulation",
      "Inheritance", 
      "Polymorphism",
      "Abstraction"
    ],
    "exampleUsage": "# Exemplo de uso da classe..."
  }
}
```

Este node é ideal para desenvolvedores que querem criar estruturas de dados complexas seguindo as melhores práticas da programação orientada a objetos em Python.