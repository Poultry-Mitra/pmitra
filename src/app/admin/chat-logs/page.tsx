// src/app/admin/chat-logs/page.tsx
"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown, Eye, Loader2 } from "lucide-react";
import { useFirestore } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from "firebase/firestore";
import type { ChatSession } from "@/lib/types"; // Assuming ChatSession type exists
import { format }s from 'date-fns';

export default function ChatLogsPage() {
    const firestore = useFirestore();
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

    const chatLogsQuery = query(collection(firestore, "chatLogs"), orderBy("startTime", "desc"));
    const { data: chatLogs, isLoading } = useCollection<ChatSession>(chatLogsQuery);
    
    const handleViewChat = (log: ChatSession) => {
        setSelectedSession(log);
        // In a real app, you would open a dialog or a new page to show the full chat
        alert(`Viewing chat for user ${log.userName}:\n\nLast Query: ${log.lastQuery}\nAI Response: ${log.lastResponse}`);
    }

    const handleExportLog = (logId: string) => {
        alert(`Exporting chat log: ${logId}`);
    }

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
                    <CardHeader>
                        <CardTitle>All Chat Sessions</CardTitle>
                        <CardDescription>A log of all AI chat interactions on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Last Query</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mx-auto animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : !chatLogs || chatLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No chat logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    chatLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="font-medium">{log.userName}</div>
                                                <div className="text-sm text-muted-foreground">{log.userEmail}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={log.userRole === 'admin' ? 'default' : 'secondary'} className="capitalize">{log.userRole}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="truncate max-w-xs block">{log.lastQuery}</span>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(log.startTime), "dd MMM yyyy, hh:mm a")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewChat(log)}>
                                                            <Eye className="mr-2" /> View Chat
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleExportLog(log.id)}>
                                                            <FileDown className="mr-2" /> Export Log
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
