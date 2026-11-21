uint numInstances =
    isAABBinFrustum(box) ? 1 : 0;

in_DrawCommands[idx].instanceCount =
    numInstances;

atomicAdd(numVisibleMeshes, numInstances);





struct TransparentFragment
{
    float R, G, B, A;
    float Depth;
    uint32_t Next;
};