import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model Project
 *
 */
export type ProjectModel = runtime.Types.Result.DefaultSelection<Prisma.$ProjectPayload>;
export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null;
    _min: ProjectMinAggregateOutputType | null;
    _max: ProjectMaxAggregateOutputType | null;
};
export type ProjectMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    slug: string | null;
    createdAt: Date | null;
};
export type ProjectMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    slug: string | null;
    createdAt: Date | null;
};
export type ProjectCountAggregateOutputType = {
    id: number;
    name: number;
    slug: number;
    createdAt: number;
    _all: number;
};
export type ProjectMinAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    createdAt?: true;
};
export type ProjectMaxAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    createdAt?: true;
};
export type ProjectCountAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    createdAt?: true;
    _all?: true;
};
export type ProjectAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Project to aggregate.
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ProjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Projects
    **/
    _count?: true | ProjectCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ProjectMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ProjectMaxAggregateInputType;
};
export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
    [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProject[P]> : Prisma.GetScalarType<T[P], AggregateProject[P]>;
};
export type ProjectGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithAggregationInput | Prisma.ProjectOrderByWithAggregationInput[];
    by: Prisma.ProjectScalarFieldEnum[] | Prisma.ProjectScalarFieldEnum;
    having?: Prisma.ProjectScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProjectCountAggregateInputType | true;
    _min?: ProjectMinAggregateInputType;
    _max?: ProjectMaxAggregateInputType;
};
export type ProjectGroupByOutputType = {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    _count: ProjectCountAggregateOutputType | null;
    _min: ProjectMinAggregateOutputType | null;
    _max: ProjectMaxAggregateOutputType | null;
};
type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProjectGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProjectGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProjectGroupByOutputType[P]>;
}>>;
export type ProjectWhereInput = {
    AND?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    OR?: Prisma.ProjectWhereInput[];
    NOT?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    id?: Prisma.StringFilter<"Project"> | string;
    name?: Prisma.StringFilter<"Project"> | string;
    slug?: Prisma.StringFilter<"Project"> | string;
    createdAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    agents?: Prisma.AgentListRelationFilter;
    threads?: Prisma.ThreadListRelationFilter;
    messages?: Prisma.MessageListRelationFilter;
    issues?: Prisma.IssueListRelationFilter;
};
export type ProjectOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    agents?: Prisma.AgentOrderByRelationAggregateInput;
    threads?: Prisma.ThreadOrderByRelationAggregateInput;
    messages?: Prisma.MessageOrderByRelationAggregateInput;
    issues?: Prisma.IssueOrderByRelationAggregateInput;
};
export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    slug?: string;
    AND?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    OR?: Prisma.ProjectWhereInput[];
    NOT?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    name?: Prisma.StringFilter<"Project"> | string;
    createdAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    agents?: Prisma.AgentListRelationFilter;
    threads?: Prisma.ThreadListRelationFilter;
    messages?: Prisma.MessageListRelationFilter;
    issues?: Prisma.IssueListRelationFilter;
}, "id" | "slug">;
export type ProjectOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ProjectCountOrderByAggregateInput;
    _max?: Prisma.ProjectMaxOrderByAggregateInput;
    _min?: Prisma.ProjectMinOrderByAggregateInput;
};
export type ProjectScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProjectScalarWhereWithAggregatesInput | Prisma.ProjectScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProjectScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProjectScalarWhereWithAggregatesInput | Prisma.ProjectScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Project"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Project"> | string;
    slug?: Prisma.StringWithAggregatesFilter<"Project"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Project"> | Date | string;
};
export type ProjectCreateInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    agents?: Prisma.AgentCreateNestedManyWithoutProjectInput;
    threads?: Prisma.ThreadCreateNestedManyWithoutProjectInput;
    messages?: Prisma.MessageCreateNestedManyWithoutProjectInput;
    issues?: Prisma.IssueCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    agents?: Prisma.AgentUncheckedCreateNestedManyWithoutProjectInput;
    threads?: Prisma.ThreadUncheckedCreateNestedManyWithoutProjectInput;
    messages?: Prisma.MessageUncheckedCreateNestedManyWithoutProjectInput;
    issues?: Prisma.IssueUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    agents?: Prisma.AgentUpdateManyWithoutProjectNestedInput;
    threads?: Prisma.ThreadUpdateManyWithoutProjectNestedInput;
    messages?: Prisma.MessageUpdateManyWithoutProjectNestedInput;
    issues?: Prisma.IssueUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    agents?: Prisma.AgentUncheckedUpdateManyWithoutProjectNestedInput;
    threads?: Prisma.ThreadUncheckedUpdateManyWithoutProjectNestedInput;
    messages?: Prisma.MessageUncheckedUpdateManyWithoutProjectNestedInput;
    issues?: Prisma.IssueUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateManyInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
};
export type ProjectUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProjectUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProjectScalarRelationFilter = {
    is?: Prisma.ProjectWhereInput;
    isNot?: Prisma.ProjectWhereInput;
};
export type ProjectCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ProjectMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ProjectMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ProjectCreateNestedOneWithoutAgentsInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutAgentsInput, Prisma.ProjectUncheckedCreateWithoutAgentsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutAgentsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutAgentsNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutAgentsInput, Prisma.ProjectUncheckedCreateWithoutAgentsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutAgentsInput;
    upsert?: Prisma.ProjectUpsertWithoutAgentsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutAgentsInput, Prisma.ProjectUpdateWithoutAgentsInput>, Prisma.ProjectUncheckedUpdateWithoutAgentsInput>;
};
export type ProjectCreateNestedOneWithoutThreadsInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutThreadsInput, Prisma.ProjectUncheckedCreateWithoutThreadsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutThreadsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutThreadsNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutThreadsInput, Prisma.ProjectUncheckedCreateWithoutThreadsInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutThreadsInput;
    upsert?: Prisma.ProjectUpsertWithoutThreadsInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutThreadsInput, Prisma.ProjectUpdateWithoutThreadsInput>, Prisma.ProjectUncheckedUpdateWithoutThreadsInput>;
};
export type ProjectCreateNestedOneWithoutMessagesInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutMessagesInput, Prisma.ProjectUncheckedCreateWithoutMessagesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutMessagesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutMessagesInput, Prisma.ProjectUncheckedCreateWithoutMessagesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutMessagesInput;
    upsert?: Prisma.ProjectUpsertWithoutMessagesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutMessagesInput, Prisma.ProjectUpdateWithoutMessagesInput>, Prisma.ProjectUncheckedUpdateWithoutMessagesInput>;
};
export type ProjectCreateNestedOneWithoutIssuesInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutIssuesInput, Prisma.ProjectUncheckedCreateWithoutIssuesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutIssuesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutIssuesNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutIssuesInput, Prisma.ProjectUncheckedCreateWithoutIssuesInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutIssuesInput;
    upsert?: Prisma.ProjectUpsertWithoutIssuesInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutIssuesInput, Prisma.ProjectUpdateWithoutIssuesInput>, Prisma.ProjectUncheckedUpdateWithoutIssuesInput>;
};
export type ProjectCreateWithoutAgentsInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    threads?: Prisma.ThreadCreateNestedManyWithoutProjectInput;
    messages?: Prisma.MessageCreateNestedManyWithoutProjectInput;
    issues?: Prisma.IssueCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutAgentsInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    threads?: Prisma.ThreadUncheckedCreateNestedManyWithoutProjectInput;
    messages?: Prisma.MessageUncheckedCreateNestedManyWithoutProjectInput;
    issues?: Prisma.IssueUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutAgentsInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutAgentsInput, Prisma.ProjectUncheckedCreateWithoutAgentsInput>;
};
export type ProjectUpsertWithoutAgentsInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutAgentsInput, Prisma.ProjectUncheckedUpdateWithoutAgentsInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutAgentsInput, Prisma.ProjectUncheckedCreateWithoutAgentsInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutAgentsInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutAgentsInput, Prisma.ProjectUncheckedUpdateWithoutAgentsInput>;
};
export type ProjectUpdateWithoutAgentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    threads?: Prisma.ThreadUpdateManyWithoutProjectNestedInput;
    messages?: Prisma.MessageUpdateManyWithoutProjectNestedInput;
    issues?: Prisma.IssueUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutAgentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    threads?: Prisma.ThreadUncheckedUpdateManyWithoutProjectNestedInput;
    messages?: Prisma.MessageUncheckedUpdateManyWithoutProjectNestedInput;
    issues?: Prisma.IssueUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutThreadsInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    agents?: Prisma.AgentCreateNestedManyWithoutProjectInput;
    messages?: Prisma.MessageCreateNestedManyWithoutProjectInput;
    issues?: Prisma.IssueCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutThreadsInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    agents?: Prisma.AgentUncheckedCreateNestedManyWithoutProjectInput;
    messages?: Prisma.MessageUncheckedCreateNestedManyWithoutProjectInput;
    issues?: Prisma.IssueUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutThreadsInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutThreadsInput, Prisma.ProjectUncheckedCreateWithoutThreadsInput>;
};
export type ProjectUpsertWithoutThreadsInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutThreadsInput, Prisma.ProjectUncheckedUpdateWithoutThreadsInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutThreadsInput, Prisma.ProjectUncheckedCreateWithoutThreadsInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutThreadsInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutThreadsInput, Prisma.ProjectUncheckedUpdateWithoutThreadsInput>;
};
export type ProjectUpdateWithoutThreadsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    agents?: Prisma.AgentUpdateManyWithoutProjectNestedInput;
    messages?: Prisma.MessageUpdateManyWithoutProjectNestedInput;
    issues?: Prisma.IssueUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutThreadsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    agents?: Prisma.AgentUncheckedUpdateManyWithoutProjectNestedInput;
    messages?: Prisma.MessageUncheckedUpdateManyWithoutProjectNestedInput;
    issues?: Prisma.IssueUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutMessagesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    agents?: Prisma.AgentCreateNestedManyWithoutProjectInput;
    threads?: Prisma.ThreadCreateNestedManyWithoutProjectInput;
    issues?: Prisma.IssueCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutMessagesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    agents?: Prisma.AgentUncheckedCreateNestedManyWithoutProjectInput;
    threads?: Prisma.ThreadUncheckedCreateNestedManyWithoutProjectInput;
    issues?: Prisma.IssueUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutMessagesInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutMessagesInput, Prisma.ProjectUncheckedCreateWithoutMessagesInput>;
};
export type ProjectUpsertWithoutMessagesInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutMessagesInput, Prisma.ProjectUncheckedUpdateWithoutMessagesInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutMessagesInput, Prisma.ProjectUncheckedCreateWithoutMessagesInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutMessagesInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutMessagesInput, Prisma.ProjectUncheckedUpdateWithoutMessagesInput>;
};
export type ProjectUpdateWithoutMessagesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    agents?: Prisma.AgentUpdateManyWithoutProjectNestedInput;
    threads?: Prisma.ThreadUpdateManyWithoutProjectNestedInput;
    issues?: Prisma.IssueUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutMessagesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    agents?: Prisma.AgentUncheckedUpdateManyWithoutProjectNestedInput;
    threads?: Prisma.ThreadUncheckedUpdateManyWithoutProjectNestedInput;
    issues?: Prisma.IssueUncheckedUpdateManyWithoutProjectNestedInput;
};
export type ProjectCreateWithoutIssuesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    agents?: Prisma.AgentCreateNestedManyWithoutProjectInput;
    threads?: Prisma.ThreadCreateNestedManyWithoutProjectInput;
    messages?: Prisma.MessageCreateNestedManyWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutIssuesInput = {
    id?: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
    agents?: Prisma.AgentUncheckedCreateNestedManyWithoutProjectInput;
    threads?: Prisma.ThreadUncheckedCreateNestedManyWithoutProjectInput;
    messages?: Prisma.MessageUncheckedCreateNestedManyWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutIssuesInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutIssuesInput, Prisma.ProjectUncheckedCreateWithoutIssuesInput>;
};
export type ProjectUpsertWithoutIssuesInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutIssuesInput, Prisma.ProjectUncheckedUpdateWithoutIssuesInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutIssuesInput, Prisma.ProjectUncheckedCreateWithoutIssuesInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutIssuesInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutIssuesInput, Prisma.ProjectUncheckedUpdateWithoutIssuesInput>;
};
export type ProjectUpdateWithoutIssuesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    agents?: Prisma.AgentUpdateManyWithoutProjectNestedInput;
    threads?: Prisma.ThreadUpdateManyWithoutProjectNestedInput;
    messages?: Prisma.MessageUpdateManyWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutIssuesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    agents?: Prisma.AgentUncheckedUpdateManyWithoutProjectNestedInput;
    threads?: Prisma.ThreadUncheckedUpdateManyWithoutProjectNestedInput;
    messages?: Prisma.MessageUncheckedUpdateManyWithoutProjectNestedInput;
};
/**
 * Count Type ProjectCountOutputType
 */
export type ProjectCountOutputType = {
    agents: number;
    threads: number;
    messages: number;
    issues: number;
};
export type ProjectCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    agents?: boolean | ProjectCountOutputTypeCountAgentsArgs;
    threads?: boolean | ProjectCountOutputTypeCountThreadsArgs;
    messages?: boolean | ProjectCountOutputTypeCountMessagesArgs;
    issues?: boolean | ProjectCountOutputTypeCountIssuesArgs;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProjectCountOutputType
     */
    select?: Prisma.ProjectCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountAgentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AgentWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountThreadsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ThreadWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountMessagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MessageWhereInput;
};
/**
 * ProjectCountOutputType without action
 */
export type ProjectCountOutputTypeCountIssuesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.IssueWhereInput;
};
export type ProjectSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    createdAt?: boolean;
    agents?: boolean | Prisma.Project$agentsArgs<ExtArgs>;
    threads?: boolean | Prisma.Project$threadsArgs<ExtArgs>;
    messages?: boolean | Prisma.Project$messagesArgs<ExtArgs>;
    issues?: boolean | Prisma.Project$issuesArgs<ExtArgs>;
    _count?: boolean | Prisma.ProjectCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectScalar = {
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    createdAt?: boolean;
};
export type ProjectOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "slug" | "createdAt", ExtArgs["result"]["project"]>;
export type ProjectInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    agents?: boolean | Prisma.Project$agentsArgs<ExtArgs>;
    threads?: boolean | Prisma.Project$threadsArgs<ExtArgs>;
    messages?: boolean | Prisma.Project$messagesArgs<ExtArgs>;
    issues?: boolean | Prisma.Project$issuesArgs<ExtArgs>;
    _count?: boolean | Prisma.ProjectCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ProjectIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ProjectIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ProjectPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Project";
    objects: {
        agents: Prisma.$AgentPayload<ExtArgs>[];
        threads: Prisma.$ThreadPayload<ExtArgs>[];
        messages: Prisma.$MessagePayload<ExtArgs>[];
        issues: Prisma.$IssuePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
    }, ExtArgs["result"]["project"]>;
    composites: {};
};
export type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProjectPayload, S>;
export type ProjectCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProjectCountAggregateInputType | true;
};
export interface ProjectDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Project'];
        meta: {
            name: 'Project';
        };
    };
    /**
     * Find zero or one Project that matches the filter.
     * @param {ProjectFindUniqueArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectFindUniqueArgs>(args: Prisma.SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectFindUniqueOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectFindFirstArgs>(args?: Prisma.SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Projects
     * const projects = await prisma.project.findMany()
     *
     * // Get first 10 Projects
     * const projects = await prisma.project.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const projectWithIdOnly = await prisma.project.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ProjectFindManyArgs>(args?: Prisma.SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Project.
     * @param {ProjectCreateArgs} args - Arguments to create a Project.
     * @example
     * // Create one Project
     * const Project = await prisma.project.create({
     *   data: {
     *     // ... data to create a Project
     *   }
     * })
     *
     */
    create<T extends ProjectCreateArgs>(args: Prisma.SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Projects.
     * @param {ProjectCreateManyArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ProjectCreateManyArgs>(args?: Prisma.SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Projects and returns the data saved in the database.
     * @param {ProjectCreateManyAndReturnArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Project.
     * @param {ProjectDeleteArgs} args - Arguments to delete one Project.
     * @example
     * // Delete one Project
     * const Project = await prisma.project.delete({
     *   where: {
     *     // ... filter to delete one Project
     *   }
     * })
     *
     */
    delete<T extends ProjectDeleteArgs>(args: Prisma.SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Project.
     * @param {ProjectUpdateArgs} args - Arguments to update one Project.
     * @example
     * // Update one Project
     * const project = await prisma.project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ProjectUpdateArgs>(args: Prisma.SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Projects.
     * @param {ProjectDeleteManyArgs} args - Arguments to filter Projects to delete.
     * @example
     * // Delete a few Projects
     * const { count } = await prisma.project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ProjectDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ProjectUpdateManyArgs>(args: Prisma.SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Projects and returns the data updated in the database.
     * @param {ProjectUpdateManyAndReturnArgs} args - Arguments to update many Projects.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Project.
     * @param {ProjectUpsertArgs} args - Arguments to update or create a Project.
     * @example
     * // Update or create a Project
     * const project = await prisma.project.upsert({
     *   create: {
     *     // ... data to create a Project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project we want to update
     *   }
     * })
     */
    upsert<T extends ProjectUpsertArgs>(args: Prisma.SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectCountArgs} args - Arguments to filter Projects to count.
     * @example
     * // Count the number of Projects
     * const count = await prisma.project.count({
     *   where: {
     *     // ... the filter for the Projects we want to count
     *   }
     * })
    **/
    count<T extends ProjectCountArgs>(args?: Prisma.Subset<T, ProjectCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProjectCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProjectAggregateArgs>(args: Prisma.Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>;
    /**
     * Group by Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends ProjectGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProjectGroupByArgs['orderBy'];
    } : {
        orderBy?: ProjectGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Project model
     */
    readonly fields: ProjectFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Project.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    agents<T extends Prisma.Project$agentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$agentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    threads<T extends Prisma.Project$threadsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$threadsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    messages<T extends Prisma.Project$messagesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    issues<T extends Prisma.Project$issuesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$issuesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Project model
 */
export interface ProjectFieldRefs {
    readonly id: Prisma.FieldRef<"Project", 'String'>;
    readonly name: Prisma.FieldRef<"Project", 'String'>;
    readonly slug: Prisma.FieldRef<"Project", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Project", 'DateTime'>;
}
/**
 * Project findUnique
 */
export type ProjectFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Project to fetch.
     */
    where: Prisma.ProjectWhereUniqueInput;
};
/**
 * Project findUniqueOrThrow
 */
export type ProjectFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Project to fetch.
     */
    where: Prisma.ProjectWhereUniqueInput;
};
/**
 * Project findFirst
 */
export type ProjectFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Project to fetch.
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Projects.
     */
    cursor?: Prisma.ProjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Projects.
     */
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
/**
 * Project findFirstOrThrow
 */
export type ProjectFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Project to fetch.
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Projects.
     */
    cursor?: Prisma.ProjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Projects.
     */
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
/**
 * Project findMany
 */
export type ProjectFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter, which Projects to fetch.
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Projects.
     */
    cursor?: Prisma.ProjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number;
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
/**
 * Project create
 */
export type ProjectCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * The data needed to create a Project.
     */
    data: Prisma.XOR<Prisma.ProjectCreateInput, Prisma.ProjectUncheckedCreateInput>;
};
/**
 * Project createMany
 */
export type ProjectCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Projects.
     */
    data: Prisma.ProjectCreateManyInput | Prisma.ProjectCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Project createManyAndReturn
 */
export type ProjectCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * The data used to create many Projects.
     */
    data: Prisma.ProjectCreateManyInput | Prisma.ProjectCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Project update
 */
export type ProjectUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * The data needed to update a Project.
     */
    data: Prisma.XOR<Prisma.ProjectUpdateInput, Prisma.ProjectUncheckedUpdateInput>;
    /**
     * Choose, which Project to update.
     */
    where: Prisma.ProjectWhereUniqueInput;
};
/**
 * Project updateMany
 */
export type ProjectUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Projects.
     */
    data: Prisma.XOR<Prisma.ProjectUpdateManyMutationInput, Prisma.ProjectUncheckedUpdateManyInput>;
    /**
     * Filter which Projects to update
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * Limit how many Projects to update.
     */
    limit?: number;
};
/**
 * Project updateManyAndReturn
 */
export type ProjectUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * The data used to update Projects.
     */
    data: Prisma.XOR<Prisma.ProjectUpdateManyMutationInput, Prisma.ProjectUncheckedUpdateManyInput>;
    /**
     * Filter which Projects to update
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * Limit how many Projects to update.
     */
    limit?: number;
};
/**
 * Project upsert
 */
export type ProjectUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * The filter to search for the Project to update in case it exists.
     */
    where: Prisma.ProjectWhereUniqueInput;
    /**
     * In case the Project found by the `where` argument doesn't exist, create a new Project with this data.
     */
    create: Prisma.XOR<Prisma.ProjectCreateInput, Prisma.ProjectUncheckedCreateInput>;
    /**
     * In case the Project was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ProjectUpdateInput, Prisma.ProjectUncheckedUpdateInput>;
};
/**
 * Project delete
 */
export type ProjectDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    /**
     * Filter which Project to delete.
     */
    where: Prisma.ProjectWhereUniqueInput;
};
/**
 * Project deleteMany
 */
export type ProjectDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Projects to delete
     */
    where?: Prisma.ProjectWhereInput;
    /**
     * Limit how many Projects to delete.
     */
    limit?: number;
};
/**
 * Project.agents
 */
export type Project$agentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: Prisma.AgentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Agent
     */
    omit?: Prisma.AgentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AgentInclude<ExtArgs> | null;
    where?: Prisma.AgentWhereInput;
    orderBy?: Prisma.AgentOrderByWithRelationInput | Prisma.AgentOrderByWithRelationInput[];
    cursor?: Prisma.AgentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AgentScalarFieldEnum | Prisma.AgentScalarFieldEnum[];
};
/**
 * Project.threads
 */
export type Project$threadsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: Prisma.ThreadSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Thread
     */
    omit?: Prisma.ThreadOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ThreadInclude<ExtArgs> | null;
    where?: Prisma.ThreadWhereInput;
    orderBy?: Prisma.ThreadOrderByWithRelationInput | Prisma.ThreadOrderByWithRelationInput[];
    cursor?: Prisma.ThreadWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ThreadScalarFieldEnum | Prisma.ThreadScalarFieldEnum[];
};
/**
 * Project.messages
 */
export type Project$messagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: Prisma.MessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Message
     */
    omit?: Prisma.MessageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MessageInclude<ExtArgs> | null;
    where?: Prisma.MessageWhereInput;
    orderBy?: Prisma.MessageOrderByWithRelationInput | Prisma.MessageOrderByWithRelationInput[];
    cursor?: Prisma.MessageWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MessageScalarFieldEnum | Prisma.MessageScalarFieldEnum[];
};
/**
 * Project.issues
 */
export type Project$issuesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: Prisma.IssueSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Issue
     */
    omit?: Prisma.IssueOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.IssueInclude<ExtArgs> | null;
    where?: Prisma.IssueWhereInput;
    orderBy?: Prisma.IssueOrderByWithRelationInput | Prisma.IssueOrderByWithRelationInput[];
    cursor?: Prisma.IssueWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.IssueScalarFieldEnum | Prisma.IssueScalarFieldEnum[];
};
/**
 * Project without action
 */
export type ProjectDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Project
     */
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ProjectInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=Project.d.ts.map