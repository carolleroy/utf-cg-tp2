from pathlib import Path
from collada_mesh import convert_collada

folder = Path(__file__).resolve().parents[1] / 'assets' / 'models' / 'pinheiro'
count = convert_collada(folder / 'deco0057.dae', folder / 'pinheiro.json', ('alfa_010-mesh',))
print(f'{count} triângulos exportados para pinheiro.json')
