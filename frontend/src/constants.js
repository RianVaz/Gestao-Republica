import { Home, Users, ClipboardList, AlertTriangle, Box, ArrowRightLeft, User } from 'lucide-react';

export const menuItems = [
  { id: 'dashboard', label: 'Visão Geral', icon: Home },
  { id: 'membros', label: 'Moradores', icon: Users },
  { id: 'tarefas', label: 'Tarefas', icon: ClipboardList },
  { id: 'punicoes', label: 'Punições', icon: AlertTriangle },
  { id: 'inventario', label: 'Inventário', icon: Box },
  { id: 'emprestimos', label: 'Empréstimos', icon: ArrowRightLeft },
  { id: 'perfil', label: 'Meu Perfil', icon: User },
];