import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Save, Edit, Printer, Share2, Upload, Trash2, ChefHat, Clock } from 'lucide-react';

const UNITS = ['Kg', 'gramas', 'xícaras', 'ml', 'colher de sopa', 'colher de chá'];
const ING_ROWS = 25;
const PREP_ROWS = 25;
const PHOTO_SLOTS = 4;
const STORAGE_KEY = 'receitas_familia_v1';

type Ingredient = { nome: string; quantidade: string; medida: string };
type Recipe = {
  id: string;
  nome: string;
  tempo: string;
  ingredientes: Ingredient[];
  modoPreparo: string[];
  fotos: (string | null)[];
  criadoEm: string;
};

const emptyIngredients = (): Ingredient[] =>
  Array.from({ length: ING_ROWS }, () => ({ nome: '', quantidade: '', medida: '' }));
const emptyPreparo = (): string[] => Array.from({ length: PREP_ROWS }, () => '');
const emptyFotos = (): (string | null)[] => Array.from({ length: PHOTO_SLOTS }, () => null);

const pad = <T,>(arr: T[], len: number, filler: T): T[] => [...arr, ...Array.from({ length: Math.max(0, len - arr.length) }, () => filler)].slice(0, len);

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'sample-bolo-cenoura',
    nome: 'Bolo de Cenoura com Cobertura de Chocolate',
    tempo: '50 minutos',
    ingredientes: pad(
      [
        { nome: 'Cenoura média ralada', quantidade: '3', medida: 'xícaras' },
        { nome: 'Ovos', quantidade: '4', medida: 'xícaras' },
        { nome: 'Óleo', quantidade: '1', medida: 'xícaras' },
        { nome: 'Açúcar', quantidade: '2', medida: 'xícaras' },
        { nome: 'Farinha de trigo', quantidade: '2,5', medida: 'xícaras' },
        { nome: 'Fermento em pó', quantidade: '1', medida: 'colher de sopa' },
        { nome: 'Chocolate em pó (cobertura)', quantidade: '4', medida: 'colher de sopa' },
        { nome: 'Leite (cobertura)', quantidade: '100', medida: 'ml' },
        { nome: 'Manteiga (cobertura)', quantidade: '1', medida: 'colher de sopa' },
      ],
      ING_ROWS,
      { nome: '', quantidade: '', medida: '' },
    ),
    modoPreparo: pad(
      [
        'Bata no liquidificador as cenouras, ovos e óleo até ficar homogêneo.',
        'Em uma tigela, misture a farinha e o açúcar.',
        'Adicione a mistura do liquidificador e mexa bem.',
        'Por último, acrescente o fermento delicadamente.',
        'Asse em forma untada a 180°C por cerca de 40 minutos.',
        'Para a cobertura: derreta a manteiga, junte o chocolate, açúcar e leite e leve ao fogo até engrossar.',
        'Despeje a cobertura ainda quente sobre o bolo.',
      ],
      PREP_ROWS,
      '',
    ),
    fotos: emptyFotos(),
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'sample-strogonoff',
    nome: 'Strogonoff de Frango Cremoso',
    tempo: '35 minutos',
    ingredientes: pad(
      [
        { nome: 'Peito de frango em cubos', quantidade: '500', medida: 'gramas' },
        { nome: 'Cebola picada', quantidade: '1', medida: 'xícaras' },
        { nome: 'Alho amassado', quantidade: '2', medida: 'colher de chá' },
        { nome: 'Manteiga', quantidade: '2', medida: 'colher de sopa' },
        { nome: 'Extrato de tomate', quantidade: '3', medida: 'colher de sopa' },
        { nome: 'Champignon fatiado', quantidade: '200', medida: 'gramas' },
        { nome: 'Creme de leite', quantidade: '300', medida: 'gramas' },
        { nome: 'Mostarda', quantidade: '1', medida: 'colher de sopa' },
        { nome: 'Sal e pimenta a gosto', quantidade: '', medida: '' },
      ],
      ING_ROWS,
      { nome: '', quantidade: '', medida: '' },
    ),
    modoPreparo: pad(
      [
        'Tempere o frango com sal, pimenta e alho.',
        'Em uma panela, derreta a manteiga e doure a cebola.',
        'Adicione o frango e refogue até dourar por completo.',
        'Acrescente o extrato de tomate e a mostarda, misture bem.',
        'Junte o champignon e cozinhe por 5 minutos.',
        'Desligue o fogo e adicione o creme de leite, mexendo até incorporar.',
        'Sirva com arroz branco e batata palha.',
      ],
      PREP_ROWS,
      '',
    ),
    fotos: emptyFotos(),
    criadoEm: new Date().toISOString(),
  },
];

const Recipes = () => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [tempo, setTempo] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingredient[]>(emptyIngredients());
  const [modoPreparo, setModoPreparo] = useState<string[]>(emptyPreparo());
  const [fotos, setFotos] = useState<(string | null)[]>(emptyFotos());
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setRecipes(JSON.parse(raw));
      } else {
        setRecipes(SAMPLE_RECIPES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_RECIPES));
      }
    } catch {}
  }, []);

  const persist = (list: Recipe[]) => {
    setRecipes(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const novaReceita = () => {
    setCurrentId(null);
    setNome('');
    setTempo('');
    setIngredientes(emptyIngredients());
    setModoPreparo(emptyPreparo());
    setFotos(emptyFotos());
    toast({ title: 'Nova receita', description: 'Formulário em branco pronto.' });
  };

  const carregarReceita = (r: Recipe) => {
    setCurrentId(r.id);
    setNome(r.nome);
    setTempo(r.tempo);
    setIngredientes([...r.ingredientes, ...emptyIngredients()].slice(0, ING_ROWS));
    setModoPreparo([...r.modoPreparo, ...emptyPreparo()].slice(0, PREP_ROWS));
    setFotos([...r.fotos, ...emptyFotos()].slice(0, PHOTO_SLOTS));
    setSearchOpen(false);
  };

  const salvar = () => {
    if (!nome.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Informe o nome da receita.', variant: 'destructive' });
      return;
    }
    const payload: Recipe = {
      id: currentId ?? crypto.randomUUID(),
      nome: nome.trim(),
      tempo,
      ingredientes,
      modoPreparo,
      fotos,
      criadoEm: new Date().toISOString(),
    };
    const list = currentId
      ? recipes.map((r) => (r.id === currentId ? payload : r))
      : [...recipes, payload];
    persist(list);
    setCurrentId(payload.id);
    toast({ title: 'Salvo!', description: `Receita "${payload.nome}" salva com sucesso.` });
  };

  const editar = () => {
    if (!currentId) {
      toast({ title: 'Selecione uma receita', description: 'Use "Procurar" para abrir uma receita.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Modo edição', description: 'Faça suas alterações e clique em Salvar.' });
  };

  const imprimir = () => window.print();

  const compartilharWhatsapp = () => {
    const ingTxt = ingredientes
      .filter((i) => i.nome.trim())
      .map((i) => `• ${i.quantidade} ${i.medida} ${i.nome}`.trim())
      .join('\n');
    const prepTxt = modoPreparo.filter((p) => p.trim()).map((p, i) => `${i + 1}. ${p}`).join('\n');
    const msg = `*${nome || 'Receita'}*\n${tempo ? `⏱ Tempo: ${tempo}\n` : ''}\n*Ingredientes:*\n${ingTxt}\n\n*Modo de Preparo:*\n${prepTxt}\n\n— Receitas da Família e Outras`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const onPhotoUpload = (idx: number, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande', description: 'Use uma imagem até 5MB.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const next = [...fotos];
      next[idx] = e.target?.result as string;
      setFotos(next);
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = (idx: number) => {
    const next = [...fotos];
    next[idx] = null;
    setFotos(next);
    if (fileRefs.current[idx]) fileRefs.current[idx]!.value = '';
  };

  const setIng = (idx: number, key: keyof Ingredient, value: string) => {
    const next = [...ingredientes];
    next[idx] = { ...next[idx], [key]: value };
    setIngredientes(next);
  };

  const setPrep = (idx: number, value: string) => {
    const next = [...modoPreparo];
    next[idx] = value;
    setModoPreparo(next);
  };

  const filtered = recipes.filter((r) => r.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-subtle print:bg-white">
      {/* Header */}
      <header className="border-b bg-gradient-primary text-primary-foreground shadow-elegant print:hidden">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Receitas da Família e Outras
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="font-semibold">
                  <Search className="mr-2 h-4 w-4" /> Procurar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Procurar receita</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Digite o nome da receita..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="max-h-72 overflow-y-auto divide-y">
                  {filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhuma receita encontrada.
                    </p>
                  )}
                  {filtered.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => carregarReceita(r)}
                      className="w-full text-left py-3 px-2 hover:bg-muted rounded-md transition-colors"
                    >
                      <p className="font-medium">{r.nome}</p>
                      {r.tempo && <p className="text-xs text-muted-foreground">⏱ {r.tempo}</p>}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={novaReceita} variant="secondary" className="font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar
            </Button>

            <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-md px-3 py-1.5">
              <label className="text-sm font-semibold">Nome:</label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da receita"
                className="h-8 w-56 bg-white text-foreground border-0"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Ingredients + Photos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingredients */}
          <Card className="p-5 shadow-card">
            <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
              🧂 Ingredientes
            </h2>
            <div className="grid grid-cols-[28px_1fr_90px_160px] gap-2 text-xs font-semibold text-muted-foreground mb-2 px-1">
              <span>#</span>
              <span>Ingrediente</span>
              <span>Qtd.</span>
              <span>Medida</span>
            </div>
            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {ingredientes.map((ing, i) => (
                <div key={i} className="grid grid-cols-[28px_1fr_90px_160px] gap-2 items-center">
                  <span className="text-xs text-muted-foreground text-center">{i + 1}</span>
                  <Input
                    value={ing.nome}
                    onChange={(e) => setIng(i, 'nome', e.target.value)}
                    className="h-8"
                    placeholder="Ex: Farinha"
                  />
                  <Input
                    value={ing.quantidade}
                    onChange={(e) => setIng(i, 'quantidade', e.target.value)}
                    className="h-8"
                    placeholder="0"
                  />
                  <Select value={ing.medida} onValueChange={(v) => setIng(i, 'medida', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Medida" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </Card>

          {/* Photos */}
          <Card className="p-5 shadow-card">
            <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
              📸 Fotos
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {fotos.map((foto, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg border-2 border-dashed border-border bg-muted/40 overflow-hidden group"
                >
                  {foto ? (
                    <>
                      <img src={foto} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => deletePhoto(i)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        aria-label="Remover foto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Foto {i + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">Clique para enviar</span>
                      <input
                        ref={(el) => (fileRefs.current[i] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onPhotoUpload(i, f);
                        }}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Preparo */}
        <Card className="p-5 shadow-card">
          <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
            👩‍🍳 Modo de Preparo
          </h2>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {modoPreparo.map((step, i) => (
              <div key={i} className="grid grid-cols-[32px_1fr] gap-2 items-center">
                <span className="text-sm font-bold text-primary text-center">{i + 1}.</span>
                <Input
                  value={step}
                  onChange={(e) => setPrep(i, e.target.value)}
                  className="h-9"
                  placeholder={`Passo ${i + 1}...`}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Footer actions */}
        <Card className="p-5 shadow-card bg-gradient-card print:hidden">
          <div className="flex flex-wrap items-end gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <label className="text-xs font-semibold text-muted-foreground block">
                  Tempo de preparo
                </label>
                <Input
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  placeholder="Ex: 45 minutos"
                  className="h-9 w-48"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={salvar} className="bg-gradient-primary hover:opacity-90 font-semibold">
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
              <Button onClick={editar} variant="outline" className="font-semibold">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button onClick={imprimir} variant="outline" className="font-semibold">
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>
              <Button
                onClick={compartilharWhatsapp}
                className="bg-[hsl(var(--secondary))] hover:opacity-90 text-secondary-foreground font-semibold"
              >
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Recipes;