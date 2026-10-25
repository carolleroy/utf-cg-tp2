import json
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'assets' / 'models' / 'presentes'
for variant in ('pre01', 'pre03', 'pre04'):
    folder = root / variant
    sources = {'v': [], 'vt': [], 'vn': []}
    faces = []
    for line in (folder / 'model.obj').read_text(encoding='utf-8').splitlines():
        fields = line.split()
        if not fields:
            continue
        if fields[0] in sources:
            sources[fields[0]].append([float(value) for value in fields[1:]])
        elif fields[0] == 'f':
            face = [[int(value) for value in vertex.split('/')] for vertex in fields[1:]]
            for corner in range(1, len(face) - 1):
                faces.append([face[0], face[corner], face[corner + 1]])

    minimum = [min(vertex[axis] for vertex in sources['v']) for axis in range(3)]
    maximum = [max(vertex[axis] for vertex in sources['v']) for axis in range(3)]
    origin = [(minimum[0] + maximum[0]) / 2, minimum[1], (minimum[2] + maximum[2]) / 2]
    height = maximum[1] - minimum[1]
    arrays = {
        'position': {'numComponents': 3, 'data': []},
        'normal': {'numComponents': 3, 'data': []},
        'texcoord': {'numComponents': 2, 'data': []},
    }
    for face in faces:
        for position, texcoord, normal in face:
            point = sources['v'][position - 1 if position > 0 else position]
            arrays['position']['data'].extend(round((point[axis] - origin[axis]) / height, 7) for axis in range(3))
            arrays['texcoord']['data'].extend(sources['vt'][texcoord - 1 if texcoord > 0 else texcoord][:2])
            arrays['normal']['data'].extend(sources['vn'][normal - 1 if normal > 0 else normal])

    (folder / 'model.json').write_text(json.dumps(arrays, separators=(',', ':')), encoding='utf-8')
    print(f'{variant}: {len(faces)} triângulos')
