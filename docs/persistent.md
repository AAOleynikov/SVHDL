# Как устроено хранение персистентных данных?

Персистентные данные хранятся в LocalStorage. Используются следующие ключи:

`IDEState` - состояние IDE на момент последнего закрытия

`projectLibrary` - список всех проектов. Json типа:

```json
{
  "projects": ["proj1", "proj2", "proj3"]
}
```

`project_<название проекта>` - информация о проекте. Json типа:

```json
{
  "files": [
    { "name": "file1.vhd", "code": "-- This is test!\n" },
    { "name": "file2.vhd", "code": "-- This is another test!\n" }
  ],
  "topLevelEntity": {
    "file": "file2.vhd",
    "name": "AndGate"
  },
  "needsRecompilation": true
}
```

`stymulus_<название проекта>` - информация о Stymulus. Json типа:

```json
{
  "parseResult": {
    "file1.vhd": {
      "entities": [],
      "architectures": []
    }
  },
  "topLevelEntity": {
    "file": "file2.vhd",
    "name": "AndGate"
  }
}
```

`simulation_<название проекта>` - данные симуляции.
