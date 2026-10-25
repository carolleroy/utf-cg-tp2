from pathlib import Path
from collada_mesh import convert_collada

folder = Path(__file__).resolve().parents[1] / 'assets' / 'models' / 'presentes' / 'digimon'
for name in ('acc144', 'acc145'):
    count = convert_collada(folder / f'{name}.dae', folder / f'{name}.json')
    print(f'{name}: {count} triângulos')
