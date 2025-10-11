

"use client";

import { PageHeader } from "@/app/admin/_components/page-header";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown } from "lucide-react";
import { mockUsers } from "@/lib/data";

const chatLogs = [
    { id: '1', user: mockUsers[1], lastMessage: 'What is the best feed for winter?', duration: '5m 32s', date: '2023-10-28' },
    { id: '2', user: mockUsers[3], lastMessage: 'Gumboro disease symptoms', duration: '12m 10s', date: '2023-10-28' },
    { id: '3', user: mockUsers[2], lastMessage: 'My hens are not laying eggs.', duration: '8m 05s', date: '2023-10-27' },
    { id: '4', user: mockUsers[4], lastMessage: 'How to increase chicken weight?', duration: '15m 45s', date: '2023-10-27' },
];


export default function ChatLogsPage() {
    return (
        <>
            <PageHeader title="AI Chat Logs" description="Review and search all user chat sessions.">
                 <Button variant="outline">
                    <FileDown className="mr-2" />
                    Export CSV
                </Button>
            </PageHeader>
            <div className="mt-8">
                <Card>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Last Message</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chatLogs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="font-medium">{log.user.name}</div>
                                            <div className="text-sm text-muted-foreground">{log.user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={log.user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{log.user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="truncate">{log.lastMessage}</span>
                                        </TableCell>
                                         <TableCell>{log.duration}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {new Date(log.date).toLocaleDateString('en-CA')}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Chat</DropdownMenuItem>
                                                    <DropdownMenuItem>Export Log</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
