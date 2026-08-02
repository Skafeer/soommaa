import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/pages/LoginPage';
import { PendingAdvertisementsPage } from '@/pages/PendingAdvertisementsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ReportsPage } from '@/pages/ReportsPage';

const queryClient = new QueryClient();

function App() {
  return (
      <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                    <Routes>
                              <Route path="/login" element={<LoginPage />} />
                                        <Route element={<ProtectedRoute />}>
                                                    <Route element={<AdminLayout />}>
                                                                  <Route path="/" element={<PendingAdvertisementsPage />} />
                                                                                <Route path="/reports" element={<ReportsPage />} />
                                                                                            </Route>
                                                                                                      </Route>
                                                                                                                <Route path="*" element={<Navigate to="/" replace />} />
                                                                                                                        </Routes>
                                                                                                                              </BrowserRouter>
                                                                                                                                  </QueryClientProvider>
                                                                                                                                    );
                                                                                                                                    }

                                                                                                                                    export default App;