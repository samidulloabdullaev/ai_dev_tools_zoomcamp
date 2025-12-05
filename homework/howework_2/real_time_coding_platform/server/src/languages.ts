import { Language } from './types';

export const languages: Language[] = [
    {
        id: 'javascript',
        name: 'JavaScript',
        monacoId: 'javascript',
        canExecuteInBrowser: true,
        defaultCode: `// JavaScript
function greet(name) {
  console.log('Hello, ' + name + '!');
}

greet('World');`,
    },
    {
        id: 'typescript',
        name: 'TypeScript',
        monacoId: 'typescript',
        canExecuteInBrowser: true,
        defaultCode: `// TypeScript
function greet(name: string): void {
  console.log(\`Hello, \${name}!\`);
}

greet('World');`,
    },
    {
        id: 'python',
        name: 'Python',
        monacoId: 'python',
        canExecuteInBrowser: false,
        defaultCode: `# Python
def greet(name):
    print(f"Hello, {name}!")

greet("World")`,
    },
    {
        id: 'java',
        name: 'Java',
        monacoId: 'java',
        canExecuteInBrowser: false,
        defaultCode: `// Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    },
    {
        id: 'cpp',
        name: 'C++',
        monacoId: 'cpp',
        canExecuteInBrowser: false,
        defaultCode: `// C++
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    },
    {
        id: 'go',
        name: 'Go',
        monacoId: 'go',
        canExecuteInBrowser: false,
        defaultCode: `// Go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    },
];

export const getDefaultLanguage = (): Language => {
    return languages[0]; // JavaScript
};

export const getLanguageById = (id: string): Language | undefined => {
    return languages.find((lang) => lang.id === id);
};
