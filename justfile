set windows-shell := ["C:\\Program Files\\Git\\bin\\sh.exe", "-c"]

start:
	bun run start

icon name:
	echo -e "import { {{name}} } from 'lucide-react-native';\nimport { iconWithClassName } from './iconWithClassName';\niconWithClassName({{name}});\nexport { {{name}} };" > lib/icons/{{name}}.tsx

component name:
	npx @react-native-reusables/cli@latest add {{name}}
